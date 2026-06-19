"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Loader2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CURSIVE_STACK =
  '"Snell Roundhand", "Segoe Script", "Bradley Hand", "Brush Script MT", "Lucida Handwriting", cursive';

const CANVAS_WIDTH = 520;
const CANVAS_HEIGHT = 180;

interface SignatureCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorName?: string | null;
  /** Receives a trimmed transparent PNG data URL. Should persist + resolve. */
  onSave: (dataUrl: string) => Promise<void>;
}

/**
 * Renders a typed name onto a canvas in the handwriting stack and exports a
 * trimmed transparent PNG. Kept identical in spirit to the on-screen typed
 * signature so the saved image matches the live preview.
 */
function typedSignatureDataUrl(name: string): string | null {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#111111";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = `64px ${CURSIVE_STACK}`;
  ctx.fillText(name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH - 40);
  return trimTransparent(canvas);
}

/** Crops fully-transparent margins so the signature image hugs the ink. */
function trimTransparent(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);
  let top = height;
  let left = width;
  let right = 0;
  let bottom = 0;
  let hasInk = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 12) {
        hasInk = true;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (!hasInk) return null;

  const pad = 8;
  left = Math.max(0, left - pad);
  top = Math.max(0, top - pad);
  right = Math.min(width - 1, right + pad);
  bottom = Math.min(height - 1, bottom + pad);
  const w = right - left + 1;
  const h = bottom - top + 1;

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d");
  if (!octx) return null;
  octx.drawImage(canvas, left, top, w, h, 0, 0, w, h);
  return out.toDataURL("image/png");
}

export function SignatureCaptureDialog({
  open,
  onOpenChange,
  doctorName,
  onSave,
}: SignatureCaptureDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const [mode, setMode] = useState<"draw" | "type">("type");
  const [typedName, setTypedName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTypedName(doctorName?.trim() ? `Dr. ${doctorName.trim()}` : "");
      setError(null);
    }
  }, [open, doctorName]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111111";
    hasDrawnRef.current = false;
  }, []);

  useEffect(() => {
    if (open && mode === "draw") {
      // Defer until the canvas is mounted in the active tab.
      requestAnimationFrame(setupCanvas);
    }
  }, [open, mode, setupCanvas]);

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasDrawnRef.current = true;
  };

  const endDraw = () => {
    drawingRef.current = false;
  };

  const handleSave = async () => {
    setError(null);
    let dataUrl: string | null = null;

    if (mode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawnRef.current) {
        setError("Draw your signature first.");
        return;
      }
      dataUrl = trimTransparent(canvas);
    } else {
      const name = typedName.trim();
      if (!name) {
        setError("Enter your name to generate a signature.");
        return;
      }
      dataUrl = typedSignatureDataUrl(name);
    }

    if (!dataUrl) {
      setError("Could not capture the signature. Try again.");
      return;
    }

    setSaving(true);
    try {
      await onSave(dataUrl);
      onOpenChange(false);
    } catch {
      setError("Failed to save signature. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5" />
            Add your signature
          </DialogTitle>
          <DialogDescription>
            Saved to your profile and applied to certificates, prescriptions, and
            letters you issue.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "draw" | "type")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="type">Type</TabsTrigger>
            <TabsTrigger value="draw">Draw</TabsTrigger>
          </TabsList>

          <TabsContent value="type" className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label htmlFor="signature-typed-name">Signature name</Label>
              <Input
                id="signature-typed-name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Dr. Your Name"
              />
            </div>
            <div className="flex h-28 items-center justify-center rounded-lg border border-border bg-white">
              <span
                style={{
                  fontFamily: CURSIVE_STACK,
                  fontSize: 44,
                  color: "#111",
                }}
              >
                {typedName.trim() || "Dr. Your Name"}
              </span>
            </div>
          </TabsContent>

          <TabsContent value="draw" className="space-y-3 pt-2">
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="h-44 w-full touch-none"
                style={{ cursor: "crosshair" }}
                onPointerDown={startDraw}
                onPointerMove={moveDraw}
                onPointerUp={endDraw}
                onPointerLeave={endDraw}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={setupCanvas}
              className="h-8"
            >
              <Eraser className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save signature"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
