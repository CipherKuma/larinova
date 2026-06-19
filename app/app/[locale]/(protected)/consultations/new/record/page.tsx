"use client";

import { useState } from "react";
import { useRouter } from "@/src/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TranscriptionView } from "@/components/consultation/TranscriptionView";
import { ConsultationResults } from "@/components/consultation/ConsultationResults";
import FreeTierExhaustedModal from "@/components/free-tier-exhausted-modal";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  UserPlus,
} from "lucide-react";

type Phase = "patient-info" | "recording" | "generating" | "results";

// Tri-state per generation step. A failed clinical generation must NEVER be
// shown as "done" — the doctor would receive a silently-empty document.
type StepStatus = "pending" | "done" | "error";

interface Consultation {
  id: string;
  consultation_code: string;
  start_time: string;
  status: string;
  doctor: { id: string; full_name: string };
}

interface Transcript {
  id: string;
  speaker: "doctor" | "patient" | "unknown";
  text: string;
  translation?: string;
  confidence: number;
  timestamp_start: number;
  timestamp_end: number;
  created_at: string;
}

interface GenerationSteps {
  recording: StepStatus;
  diarization: StepStatus;
  transcript: StepStatus;
  summary: StepStatus;
  codes: StepStatus;
  soap: StepStatus;
}

const INITIAL_GENERATION_STEPS: GenerationSteps = {
  recording: "pending",
  diarization: "pending",
  transcript: "pending",
  summary: "pending",
  codes: "pending",
  soap: "pending",
};

interface Results {
  transcripts: Transcript[];
  summary: string | null;
  medicalCodes: any | null;
  soapNote: string | null;
  patientId: string;
}

interface PatientForm {
  name: string;
  gender: string;
  email: string;
  phone: string;
  blood_group: string;
  address: string;
}

export default function NewPatientConsultationPage() {
  const router = useRouter();
  const t = useTranslations();

  const [phase, setPhase] = useState<Phase>("patient-info");
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  // Held so a failed generation can be retried without re-recording.
  const [activeConsultationId, setActiveConsultationId] = useState<
    string | null
  >(null);
  const [patientName, setPatientName] = useState("");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState<{
    used: number;
    limit: number;
  } | null>(null);

  const [generationSteps, setGenerationSteps] = useState<GenerationSteps>(
    INITIAL_GENERATION_STEPS,
  );
  // True once generation has finished if any clinical step failed.
  const [generationFailed, setGenerationFailed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [results, setResults] = useState<Results | null>(null);

  const [form, setForm] = useState<PatientForm>({
    name: "",
    gender: "",
    email: "",
    phone: "",
    blood_group: "",
    address: "",
  });
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);

  const handleStartConsultation = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/consultations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: form.name.trim(),
          patient_gender: form.gender || undefined,
          patient_dob: dateOfBirth
            ? dateOfBirth.toISOString().split("T")[0]
            : undefined,
          patient_email: form.email.trim() || undefined,
          patient_phone: form.phone.trim() || undefined,
          patient_blood_group: form.blood_group || undefined,
          patient_address: form.address.trim() || undefined,
        }),
      });
      if (res.status === 402) {
        const payload = await res.json().catch(() => ({}));
        setExhausted({
          used: typeof payload.used === "number" ? payload.used : 0,
          limit: typeof payload.limit === "number" ? payload.limit : 20,
        });
        return;
      }
      if (!res.ok)
        throw new Error(t("consultations.failedToStartConsultation"));
      const data = await res.json();
      setConsultation(data.consultation);
      setPatientName(form.name.trim());
      setPhase("recording");
    } catch {
      setSubmitError(t("consultations.failedToStartTryAgain"));
    } finally {
      setSubmitting(false);
    }
  };

  // A fetch that throws on a non-2xx response, so an API-level failure (500,
  // 4xx) is treated as a failed clinical step rather than a "successful" empty
  // document.
  const fetchOk = async (input: string, init?: RequestInit) => {
    const res = await fetch(input, init);
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return res.json();
  };

  const runGeneration = async (consultationId: string) => {
    // Reset to a clean slate so a retry doesn't keep stale error/done marks.
    setGenerationSteps({
      ...INITIAL_GENERATION_STEPS,
      recording: "done",
      diarization: "done",
    });
    setGenerationFailed(false);
    setPhase("generating");

    const failures: string[] = [];

    const transcriptPromise = fetchOk(
      `/api/consultations/${consultationId}/transcripts`,
    )
      .then((data) => {
        setGenerationSteps((prev) => ({ ...prev, transcript: "done" }));
        return data;
      })
      .catch(() => {
        failures.push("transcript");
        setGenerationSteps((prev) => ({ ...prev, transcript: "error" }));
        return { transcripts: [] };
      });

    const summaryPromise = fetchOk(
      `/api/consultations/${consultationId}/summary`,
      { method: "POST" },
    )
      .then((data) => {
        setGenerationSteps((prev) => ({ ...prev, summary: "done" }));
        return data;
      })
      .catch(() => {
        failures.push("summary");
        setGenerationSteps((prev) => ({ ...prev, summary: "error" }));
        return { summary: null };
      });

    const soapPromise = fetchOk(
      `/api/consultations/${consultationId}/soap-note`,
      { method: "POST" },
    )
      .then((data) => {
        setGenerationSteps((prev) => ({ ...prev, soap: "done" }));
        return data;
      })
      .catch(() => {
        failures.push("soap");
        setGenerationSteps((prev) => ({ ...prev, soap: "error" }));
        return { soapNote: null };
      });

    const [transcriptRes, summaryRes, soapRes] = await Promise.all([
      transcriptPromise,
      summaryPromise,
      soapPromise,
    ]);

    const soapNote = soapRes.soapNote || null;
    const fetchedTranscripts = transcriptRes.transcripts || [];

    let codesResult: any = { medicalCodes: null };
    if (soapNote) {
      try {
        codesResult = await fetchOk(
          `/api/consultations/${consultationId}/medical-codes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ soapNote }),
          },
        );
        setGenerationSteps((prev) => ({ ...prev, codes: "done" }));
      } catch {
        failures.push("codes");
        setGenerationSteps((prev) => ({ ...prev, codes: "error" }));
      }
    } else {
      // Codes depend on the SOAP note. If SOAP failed, codes can't run — mark
      // them errored too (never "done") so the doctor sees they're missing.
      setGenerationSteps((prev) => ({
        ...prev,
        codes: failures.includes("soap") ? "error" : "done",
      }));
    }

    const finalResults: Results = {
      transcripts: fetchedTranscripts,
      summary: summaryRes.summary || null,
      medicalCodes: codesResult.medicalCodes || null,
      soapNote,
      patientId: consultation?.id ?? "",
    };

    // Fetch the real patient_id from the consultation record
    try {
      const cRes = await fetch(`/api/consultations/${consultationId}`);
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.consultation?.patient?.id) {
          finalResults.patientId = cData.consultation.patient.id;
        }
      }
    } catch {
      /* non-critical */
    }

    setResults(finalResults);

    let chiefComplaint: string | undefined;
    if (soapNote) {
      const ccMatch = soapNote.match(/Chief\s+Complaint[:\s]*([^\n]+)/i);
      if (ccMatch) chiefComplaint = ccMatch[1].replace(/\*+/g, "").trim();
    }

    try {
      await fetch(`/api/consultations/${consultationId}/create-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: finalResults.summary,
          soapNote: finalResults.soapNote,
          medicalCodes: finalResults.medicalCodes,
        }),
      });
    } catch {
      /* non-critical */
    }

    try {
      await fetch(`/api/consultations/${consultationId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chief_complaint: chiefComplaint,
          summary: finalResults.summary,
        }),
      });
    } catch {
      /* non-critical */
    }

    // If any clinical generation failed, hold the doctor on the generating
    // screen with a clear error + retry instead of silently showing results
    // that look complete but are empty.
    if (failures.length > 0) {
      setGenerationFailed(true);
      return;
    }

    setPhase("results");
  };

  const handleDiarizationComplete = async (consultationId: string) => {
    setActiveConsultationId(consultationId);
    await runGeneration(consultationId);
  };

  const handleRetryGeneration = async () => {
    if (!activeConsultationId || retrying) return;
    setRetrying(true);
    try {
      await runGeneration(activeConsultationId);
    } finally {
      setRetrying(false);
    }
  };

  // Proceed to results even though one or more steps failed. The failed
  // sections are clearly marked as failed inside ConsultationResults' empty
  // states — nothing failed is ever presented as a finished document.
  const handleContinueWithPartial = () => {
    setGenerationFailed(false);
    setPhase("results");
  };

  // Phase: Patient Info Form
  if (phase === "patient-info") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-24">
        <FreeTierExhaustedModal
          open={exhausted !== null}
          onOpenChange={(v) => {
            if (!v) setExhausted(null);
          }}
          used={exhausted?.used ?? 0}
          limit={exhausted?.limit ?? 20}
        />
        {/* Header */}
        <div className="glass-card-strong p-6 border-l-4 border-primary">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t("consultations.newPatientDetails")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("consultations.newPatientDetailsDesc")}
          </p>
        </div>

        {/* Form */}
        <div className="glass-card overflow-hidden">
          {submitError && (
            <div className="bg-destructive/10 border-l-4 border-destructive p-4 text-destructive flex items-start gap-3">
              <span className="font-medium">{t("patients.error")}:</span>
              <span>{submitError}</span>
            </div>
          )}

          <div className="p-6 space-y-8">
            {/* Personal Information */}
            <div>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  {t("patients.personalInformation")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("patients.personalInfoDesc")}
                </p>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t("patients.fullName")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("patients.enterFullName")}
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t("patients.emailAddress")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder={t("patients.emailPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    {t("patients.phoneNumber")}
                  </Label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(value) => setForm({ ...form, phone: value })}
                    placeholder={t("patients.phonePlaceholder")}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="date_of_birth"
                    className="text-sm font-medium"
                  >
                    {t("patients.dateOfBirth")}
                  </Label>
                  <DatePicker
                    date={dateOfBirth}
                    onDateChange={setDateOfBirth}
                    placeholder={t("patients.selectDateOfBirth")}
                  />
                </div>

                <div>
                  <Label htmlFor="gender" className="text-sm font-medium">
                    {t("patients.gender")}
                  </Label>
                  <Select
                    value={form.gender}
                    onValueChange={(value) =>
                      setForm({ ...form, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("patients.selectGender")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("patients.male")}</SelectItem>
                      <SelectItem value="female">
                        {t("patients.female")}
                      </SelectItem>
                      <SelectItem value="other">
                        {t("patients.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="blood_group" className="text-sm font-medium">
                    {t("patients.bloodGroup")}
                  </Label>
                  <Select
                    value={form.blood_group}
                    onValueChange={(value) =>
                      setForm({ ...form, blood_group: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("patients.selectBloodGroup")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  {t("patients.addressInformation")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("patients.addressInfoDesc")}
                </p>
              </div>
              <div>
                <Label htmlFor="address" className="text-sm font-medium">
                  {t("patients.fullAddress")}
                </Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder={t("patients.addressPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass-card-strong px-6 py-4 border-t border-border flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/consultations/new" as any)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleStartConsultation}
              disabled={!form.name.trim() || submitting}
              className="min-w-[140px]"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {t("consultations.startConsultation")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-3 md:space-y-6 pb-24">
      {/* Header */}
      <div className="glass-card-strong p-4 md:p-6 border-l-4 border-primary">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg md:text-3xl font-bold text-foreground truncate">
            {t("consultations.consultationSession")}
          </h1>
          {isRecording && phase === "recording" && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-semibold text-xs md:text-sm text-foreground">
                {t("consultations.recording")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Session Info */}
      <div className="glass-card p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {t("consultations.startTime")}
            </div>
            <div className="font-semibold text-sm text-foreground">
              {new Date(consultation.start_time).toLocaleTimeString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {t("consultations.patient")}
            </div>
            <div className="font-semibold text-sm text-foreground">
              {patientName}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {t("consultations.doctor")}
            </div>
            <div className="font-semibold text-sm text-foreground">
              {consultation.doctor.full_name}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {t("common.status")}
            </div>
            <div className="font-semibold text-sm text-foreground capitalize">
              {phase === "results"
                ? "completed"
                : consultation.status.replace(/_/g, " ")}
            </div>
          </div>
        </div>
      </div>

      {/* Recording */}
      {phase === "recording" && (
        <TranscriptionView
          consultationId={consultation.id}
          isRecording={isRecording}
          onStartRecording={() => setIsRecording(true)}
          onStopRecording={() => setIsRecording(false)}
          transcripts={transcripts}
          onTranscriptUpdate={setTranscripts}
          onDiarizationComplete={handleDiarizationComplete}
        />
      )}

      {/* Generating */}
      {phase === "generating" && (
        <div className="glass-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t("consultation.generatingDocumentation")}
          </h2>
          {(
            [
              {
                key: "recording" as const,
                label: t("consultation.recordingComplete"),
              },
              {
                key: "diarization" as const,
                label: t("consultation.speakerIdComplete"),
              },
              {
                key: "transcript" as const,
                label: t("consultation.formattingTranscript"),
              },
              {
                key: "summary" as const,
                label: t("consultation.generatingAiSummary"),
              },
              {
                key: "codes" as const,
                label: t("consultation.generatingMedCodes"),
              },
              { key: "soap" as const, label: t("consultation.generatingSoap") },
            ] as const
          ).map(({ key, label }) => {
            const status = generationSteps[key];
            return (
              <div key={key} className="flex items-center gap-3">
                {status === "done" ? (
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                ) : status === "error" ? (
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground shrink-0" />
                )}
                <span
                  className={
                    status === "done"
                      ? "text-foreground"
                      : status === "error"
                        ? "text-destructive font-medium"
                        : "text-muted-foreground"
                  }
                >
                  {status === "error" ? `${label} — failed` : label}
                </span>
              </div>
            );
          })}

          {/* Failure banner — never let a failed clinical generation pass as
              "done". The doctor must explicitly retry or proceed knowing the
              document is incomplete. */}
          {generationFailed && (
            <div className="mt-4 rounded-lg border-l-4 border-destructive bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-destructive">
                    Some clinical documentation could not be generated
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The steps marked &ldquo;failed&rdquo; above were not
                    produced. Do not treat them as complete clinical records.
                    Retry generation, or continue and review the missing
                    sections manually.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleRetryGeneration}
                      disabled={retrying}
                    >
                      {retrying ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      {t("consultations.retry")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleContinueWithPartial}
                      disabled={retrying}
                    >
                      Continue anyway
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {phase === "results" && results && (
        <ConsultationResults
          transcripts={results.transcripts}
          summary={results.summary}
          medicalCodes={results.medicalCodes}
          soapNote={results.soapNote}
          consultationId={consultation.id}
          patientId={results.patientId}
        />
      )}
    </div>
  );
}
