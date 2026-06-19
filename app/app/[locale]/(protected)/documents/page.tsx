"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FileText,
  ArrowLeft,
  Download,
  Printer,
  Trash2,
  X,
  CheckCircle,
  Send,
  Plus,
  PenLine,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { DocumentsSidebar } from "@/components/documents/DocumentsSidebar";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { DocumentPrintPreview } from "@/components/documents/DocumentPrintPreview";
import { EditableField } from "@/components/documents/EditableField";
import { SickLeaveCertificateDialog } from "@/components/documents/SickLeaveCertificateDialog";
import { SignatureCaptureDialog } from "@/components/documents/SignatureCaptureDialog";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithPatient[]>([]);
  const [documentsByType, setDocumentsByType] = useState<
    Record<string, DocumentWithPatient[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<DocumentType | "all">(
    "all",
  );
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentWithPatient | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSickLeaveForm, setShowSickLeaveForm] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const printableRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const locale = params.locale as string;
  const td = useTranslations("documents");
  const tc = useTranslations("common");

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (window.sessionStorage.getItem("openSickLeaveCertificate") === "1") {
      window.sessionStorage.removeItem("openSickLeaveCertificate");
      setShowSickLeaveForm(true);
    }
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setDocumentsByType(data.documentsByType || {});
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = async (doc: DocumentWithPatient) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedDocument(data.document);
      }
    } catch (error) {
      console.error("Failed to load document:", error);
    }
  };

  const handleSave = useCallback(
    async (patch: { title?: string; content?: string }) => {
      if (!selectedDocument) return;
      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error("Save failed");
      const data = await response.json();
      setSelectedDocument((prev) =>
        prev ? { ...prev, ...data.document } : prev,
      );
      if (patch.title) loadDocuments();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDocument],
  );

  const handleStatusChange = async (status: "draft" | "finalized" | "sent") => {
    if (!selectedDocument) return;
    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedDocument((prev) =>
          prev ? { ...prev, ...data.document } : prev,
        );
        loadDocuments();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDeleteDocument = (documentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTargetId(documentId);
  };

  const confirmDeleteDocument = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/documents/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        if (selectedDocument?.id === deleteTargetId) setSelectedDocument(null);
        loadDocuments();
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handlePrint = () => {
    if (!printableRef.current || !selectedDocument) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedDocument.title}</title>
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
    if (!selectedDocument || !printableRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${selectedDocument.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
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

  // Renders the current printable preview to a base64-encoded PDF for emailing.
  const renderPdfBase64 = async (): Promise<{
    base64: string;
    filename: string;
  } | null> => {
    if (!selectedDocument || !printableRef.current) return null;
    const html2pdf = (await import("html2pdf.js")).default;
    const filename = `${selectedDocument.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
    };
    const dataUri: string = await html2pdf()
      .set(opt)
      .from(printableRef.current)
      .outputPdf("datauristring");
    const base64 = dataUri.includes(",") ? dataUri.split(",")[1] : dataUri;
    return { base64, filename };
  };

  const handleSaveSignature = async (dataUrl: string) => {
    const response = await fetch("/api/doctor/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature_image_url: dataUrl }),
    });
    if (!response.ok) throw new Error("signature_save_failed");
    // Reflect the new signature in the open preview immediately.
    setSelectedDocument((prev) => {
      if (!prev?.doctor) return prev;
      const doctor = {
        ...prev.doctor,
        signature_image_url: dataUrl,
      } as DocumentWithPatient["doctor"];
      return { ...prev, doctor };
    });
  };

  const handleSendToPatient = async () => {
    if (!selectedDocument || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const pdf = await renderPdfBase64();
      const response = await fetch(
        `/api/documents/${selectedDocument.id}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            pdf ? { pdfBase64: pdf.base64, pdfFilename: pdf.filename } : {},
          ),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSendError(
          data.code === "no_email"
            ? "Patient has no email on file."
            : "Failed to send. Please try again.",
        );
        return;
      }
      if (data.document) {
        setSelectedDocument((prev) =>
          prev ? { ...prev, ...data.document } : prev,
        );
      } else {
        setSelectedDocument((prev) =>
          prev
            ? {
                ...prev,
                status: "sent",
                sent_at: data.sent_at ?? prev.sent_at,
                sent_to: data.sent_to ?? prev.sent_to,
              }
            : prev,
        );
      }
      loadDocuments();
    } catch {
      setSendError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const folderLabel =
    selectedFolder === "all"
      ? td("allDocuments")
      : DOCUMENT_TYPES[selectedFolder as DocumentType]?.label ||
        td("allDocuments");

  const filteredDocuments = documents.filter(
    (doc) => selectedFolder === "all" || doc.document_type === selectedFolder,
  );

  const documentCounts = Object.fromEntries(
    Object.entries(documentsByType).map(([k, v]) => [k, v.length]),
  );

  const sidebarLabels = {
    folders: "Folders",
    allDocuments: td("allDocuments"),
    consultationSummaries: td("consultationSummaries"),
    soapNotes: td("soapNotes"),
    referralLetters: td("referralLetters"),
    medicalCertificates: td("medicalCertificates"),
    insuranceReports: td("insuranceReports"),
    fitnessToWork: td("fitnessToWork"),
    disabilityReports: td("disabilityReports"),
    transferSummaries: td("transferSummaries"),
    prescriptionLetters: td("prescriptionLetters"),
    general: td("general"),
  };

  return (
    <div className="h-[calc(100dvh-180px)] md:h-[calc(100vh-120px)] flex gap-0 overflow-hidden rounded-lg">
      {/* Sidebar */}
      <div
        className={`w-44 min-[1200px]:w-56 flex-shrink-0 glass-card rounded-none border-r border-border overflow-y-auto hidden min-[800px]:block ${
          selectedDocument ? "min-[800px]:hidden min-[1200px]:block" : ""
        }`}
      >
        <DocumentsSidebar
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          documentCounts={documentCounts}
          totalCount={documents.length}
          labels={sidebarLabels}
        />
      </div>

      {/* Document list */}
      <DocumentsList
        documents={filteredDocuments}
        selectedDocument={selectedDocument}
        loading={loading}
        folderLabel={folderLabel}
        locale={locale}
        onDocumentClick={handleDocumentClick}
        onDeleteDocument={handleDeleteDocument}
        onBackToFolders={() => setSelectedDocument(null)}
        toolbarAction={
          !selectedDocument ? (
            <Button
              size="sm"
              className="h-8"
              onClick={() => setShowSickLeaveForm(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {td("sickLeaveForm.action")}
            </Button>
          ) : null
        }
        labels={{
          noDocumentsFound: td("noDocumentsFound"),
          noDocumentsHint: "Complete consultations to generate documents",
        }}
      />

      {/* Detail panel */}
      {selectedDocument && (
        <div className="flex-1 flex flex-col overflow-hidden border-l border-border glass-card rounded-none">
          {/* Detail header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                className="h-8 w-8 flex-shrink-0 min-[800px]:hidden inline-flex items-center justify-center rounded-md hover:bg-muted/50"
                onClick={() => setSelectedDocument(null)}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              {(() => {
                const Icon =
                  DOCUMENT_TYPES[selectedDocument.document_type as DocumentType]
                    ?.icon || FileText;
                return (
                  <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                );
              })()}
              <div className="min-w-0 flex-1">
                <EditableField
                  value={selectedDocument.title}
                  onChange={(title) => handleSave({ title })}
                  className="text-base font-bold text-foreground"
                  inputClassName="text-base font-bold w-full text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowSignatureDialog(true)}
                title="Manage signature"
              >
                <PenLine className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDeleteDocument(selectedDocument.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden min-[800px]:inline-flex"
                onClick={() => setSelectedDocument(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Print preview — key resets component state when document changes */}
          <DocumentPrintPreview
            key={selectedDocument.id}
            document={selectedDocument}
            locale={locale}
            onSave={handleSave}
            printableRef={printableRef}
          />

          {/* Status actions */}
          <div className="flex-shrink-0 p-3 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedDocument.status === "draft" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("finalized")}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {td("finalize")}
                </Button>
              )}
              {selectedDocument.status === "finalized" && (
                <>
                  <Button size="sm" onClick={handleSendToPatient} disabled={sending}>
                    {sending ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3 mr-1" />
                    )}
                    {sending ? "Sending..." : "Send to patient"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange("draft")}
                    disabled={sending}
                  >
                    {td("revertToDraft")}
                  </Button>
                </>
              )}
              {selectedDocument.status === "sent" && (
                <>
                  <Button size="sm" onClick={handleSendToPatient} disabled={sending}>
                    {sending ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3 mr-1" />
                    )}
                    {sending ? "Sending..." : "Resend"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange("finalized")}
                    disabled={sending}
                  >
                    {td("revertToFinalized")}
                  </Button>
                </>
              )}
              {selectedDocument.sent_to && (
                <span className="text-xs text-muted-foreground">
                  Sent to {selectedDocument.sent_to}
                </span>
              )}
              {sendError && (
                <span className="text-xs text-destructive">{sendError}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTargetId(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{tc("delete")}</DialogTitle>
            <DialogDescription>{td("deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTargetId(null)}
              disabled={deleting}
            >
              {tc("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDocument}
              disabled={deleting}
            >
              {deleting ? "..." : tc("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SickLeaveCertificateDialog
        open={showSickLeaveForm}
        onOpenChange={setShowSickLeaveForm}
        onCreated={(document) => {
          setDocuments((current) => [document, ...current]);
          setDocumentsByType((current) => {
            const medicalCertificates = current.medical_certificate || [];
            return {
              ...current,
              medical_certificate: [document, ...medicalCertificates],
            };
          });
          setSelectedDocument(document);
        }}
      />
      <SignatureCaptureDialog
        open={showSignatureDialog}
        onOpenChange={setShowSignatureDialog}
        doctorName={selectedDocument?.doctor?.full_name}
        onSave={handleSaveSignature}
      />
    </div>
  );
}
