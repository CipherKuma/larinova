"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Edit2,
  Send,
  Printer,
  Download,
  CheckCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DocumentType,
  DOCUMENT_TYPES,
  DocumentWithPatient,
} from "@/types/helena";
import { DocumentPrintPreview } from "@/components/documents/DocumentPrintPreview";

export default function DocumentDetailPage() {
  const [document, setDocument] = useState<DocumentWithPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const documentId = params.id as string;
  const t = useTranslations();
  const td = useTranslations("documents");

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
      } else {
        router.push(`/${locale}/documents`);
      }
    } catch (error) {
      console.error("Failed to load document:", error);
      router.push(`/${locale}/documents`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(
    async (patch: { title?: string; content?: string }) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error("Save failed");
      const data = await response.json();
      setDocument((prev) => (prev ? { ...prev, ...data.document } : prev));
    },
    [documentId],
  );

  const handleStatusChange = async (status: "draft" | "finalized" | "sent") => {
    if (!document) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        setDocument({ ...document, ...data.document });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(`/${locale}/documents`);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  const handlePrint = () => {
    if (!printableRef.current || !document) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.title}</title>
          <style>
            body { margin: 0; padding: 20px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${printableRef.current.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = async () => {
    if (!document || !printableRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${document.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
      };
      await html2pdf().set(opt).from(printableRef.current).save();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "id" ? "id-ID" : "en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            <Clock className="w-3 h-3 mr-1" />
            {td("statusDraft")}
          </Badge>
        );
      case "finalized":
        return (
          <Badge variant="outline" className="border-green-500 text-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            {td("statusFinalized")}
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            <Send className="w-3 h-3 mr-1" />
            {td("statusSent")}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
        <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <p className="text-lg text-muted-foreground">{td("notFound")}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`/${locale}/documents`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {td("backToDocuments")}
        </Button>
      </div>
    );
  }

  const docInfo = DOCUMENT_TYPES[document.document_type as DocumentType];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/${locale}/documents`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div>
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const Icon = docInfo?.icon || FileText;
                  return <Icon className="w-7 h-7 text-muted-foreground" />;
                })()}
                <h1 className="text-2xl font-bold text-foreground">
                  {document.title}
                </h1>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {docInfo?.label || t("chat.documentFallback")}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(document.created_at)}
                </span>
                {getStatusBadge(document.status)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              {td("print")}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? "..." : "PDF"}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Content — identical renderer to the documents list panel */}
        <div className="lg:col-span-2">
          <DocumentPrintPreview
            key={document.id}
            document={document}
            locale={locale}
            onSave={handleSave}
            printableRef={printableRef}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          {document.patient && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                {td("patient")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {document.patient.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {document.patient.patient_code}
                    </p>
                  </div>
                </div>
                {document.patient.date_of_birth && (
                  <p className="text-sm text-muted-foreground">
                    {td("dob")}{" "}
                    {new Date(
                      document.patient.date_of_birth,
                    ).toLocaleDateString()}
                  </p>
                )}
                {document.patient.gender && (
                  <p className="text-sm text-muted-foreground">
                    {td("gender")} {document.patient.gender}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Doctor Info */}
          {document.doctor && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                {td("createdBy")}
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-foreground">
                  Dr. {document.doctor.full_name}
                </p>
                {document.doctor.specialization && (
                  <p className="text-sm text-muted-foreground">
                    {document.doctor.specialization}
                  </p>
                )}
                {document.doctor.license_number && (
                  <p className="text-sm text-muted-foreground">
                    {td("license")} {document.doctor.license_number}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status Actions */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {td("actions")}
            </h3>
            <div className="space-y-2">
              {document.status === "draft" && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange("finalized")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {td("markAsFinalized")}
                </Button>
              )}
              {document.status === "finalized" && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => handleStatusChange("sent")}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {td("markAsSent")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusChange("draft")}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {td("revertToDraft")}
                  </Button>
                </>
              )}
              {document.status === "sent" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange("finalized")}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {td("revertToFinalized")}
                </Button>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {td("details")}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{td("created")}</span>
                <span className="text-foreground">
                  {formatDate(document.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{td("updated")}</span>
                <span className="text-foreground">
                  {formatDate(document.updated_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{td("type")}</span>
                <span className="text-foreground">{docInfo?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{td("status")}</span>
                <span className="text-foreground capitalize">
                  {document.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={confirmDeleteOpen}
        onOpenChange={(open) => {
          if (!open && !deleting) setConfirmDeleteOpen(false);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("common.delete")}</DialogTitle>
            <DialogDescription>{td("deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={deleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "..." : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
