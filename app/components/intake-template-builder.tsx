"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, GripVertical, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type FieldType =
  | "short_text"
  | "long_text"
  | "single_select"
  | "multi_select"
  | "number"
  | "date"
  | "yes_no"
  | "file";

interface IntakeField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface IntakeTemplate {
  id?: string;
  title: string;
  description?: string | null;
  fields: IntakeField[];
}

const TYPE_LABELS: Record<FieldType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  single_select: "Single select",
  multi_select: "Multi select",
  number: "Number",
  date: "Date",
  yes_no: "Yes / No",
  file: "File upload",
};

const DEFAULT_FIELDS: IntakeField[] = [
  {
    id: crypto.randomUUID(),
    type: "long_text",
    label: "Chief complaint",
    required: true,
    placeholder: "What brings you in today?",
  },
  {
    id: crypto.randomUUID(),
    type: "short_text",
    label: "Duration of symptoms",
    required: false,
    placeholder: "e.g. 3 days",
  },
  {
    id: crypto.randomUUID(),
    type: "yes_no",
    label: "Do you have any known allergies?",
    required: false,
  },
];

export function IntakeTemplateBuilder() {
  const [template, setTemplate] = useState<IntakeTemplate>({
    title: "Pre-consult intake",
    description: "Tell us what's going on so your doctor can prepare.",
    fields: DEFAULT_FIELDS,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/intake-templates");
        if (!res.ok) throw new Error("load_failed");
        const json = await res.json();
        const first = json.templates?.[0];
        if (first && !cancelled) {
          setTemplate({
            id: first.id,
            title: first.title,
            description: first.description,
            fields: Array.isArray(first.fields) ? first.fields : DEFAULT_FIELDS,
          });
        }
      } catch {
        // Keep defaults.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function addField() {
    setTemplate((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id: crypto.randomUUID(),
          type: "short_text",
          label: "New field",
          required: false,
        },
      ],
    }));
  }

  function updateField(id: string, patch: Partial<IntakeField>) {
    setTemplate((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  }

  function removeField(id: string) {
    setTemplate((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  }

  function moveField(id: string, dir: -1 | 1) {
    setTemplate((prev) => {
      const idx = prev.fields.findIndex((f) => f.id === id);
      if (idx < 0) return prev;
      const next = [...prev.fields];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, fields: next };
    });
  }

  async function save() {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/intake-templates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: template.id,
          title: template.title,
          description: template.description ?? null,
          fields: template.fields,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.detail ?? "save_failed");
      }
      const json = await res.json();
      setTemplate((prev) => ({ ...prev, id: json.id }));
      setToast("Saved.");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading template…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-border bg-card/50 p-6">
        <div className="space-y-2">
          <Label htmlFor="template-title">Form title</Label>
          <Input
            id="template-title"
            value={template.title}
            onChange={(e) =>
              setTemplate((prev) => ({ ...prev, title: e.target.value }))
            }
            maxLength={200}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-description">Form description</Label>
          <Textarea
            id="template-description"
            value={template.description ?? ""}
            onChange={(e) =>
              setTemplate((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={2}
            maxLength={1000}
          />
        </div>
      </div>

      <div className="space-y-3">
        {template.fields.map((field, idx) => (
          <FieldRow
            key={field.id}
            field={field}
            onChange={(patch) => updateField(field.id, patch)}
            onRemove={() => removeField(field.id)}
            onMoveUp={idx > 0 ? () => moveField(field.id, -1) : undefined}
            onMoveDown={
              idx < template.fields.length - 1
                ? () => moveField(field.id, 1)
                : undefined
            }
          />
        ))}

        <Button variant="outline" onClick={addField} type="button">
          <Plus className="mr-2 h-4 w-4" />
          Add field
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {toast ??
            "Saved templates become the default intake shown on your booking page."}
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save template"
          )}
        </Button>
      </div>
    </div>
  );
}

function FieldRow({
  field,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  field: IntakeField;
  onChange: (patch: Partial<IntakeField>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const showOptions =
    field.type === "single_select" || field.type === "multi_select";

  return (
    <div className="rounded-xl border border-border bg-card/30 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1 pt-1 text-muted-foreground">
          <button
            type="button"
            className="rounded p-1 hover:text-foreground disabled:opacity-30"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            aria-label="Move up"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded p-1 hover:text-foreground disabled:opacity-30"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            aria-label="Move down"
          >
            <GripVertical className="h-4 w-4 rotate-180" />
          </button>
        </div>
        <div className="grid flex-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Label</Label>
            <Input
              value={field.label}
              onChange={(e) => onChange({ label: e.target.value })}
              maxLength={200}
            />
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select
              value={field.type}
              onValueChange={(v) => onChange({ type: v as FieldType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Placeholder (optional)</Label>
            <Input
              value={field.placeholder ?? ""}
              onChange={(e) =>
                onChange({ placeholder: e.target.value || undefined })
              }
              maxLength={200}
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch
              checked={field.required}
              onCheckedChange={(checked) => onChange({ required: checked })}
            />
            <span className="text-sm">Required</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-2 text-muted-foreground hover:text-red-500"
          aria-label="Remove field"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {showOptions ? (
        <OptionsEditor
          options={field.options ?? []}
          onChange={(options) => onChange({ options })}
        />
      ) : null}
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        Options
      </Label>
      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Input
            value={opt}
            onChange={(e) => {
              const next = [...options];
              next[idx] = e.target.value;
              onChange(next);
            }}
            maxLength={200}
          />
          <button
            type="button"
            onClick={() => onChange(options.filter((_, i) => i !== idx))}
            className="rounded p-2 text-muted-foreground hover:text-red-500"
            aria-label="Remove option"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onChange([...options, ""])}
        type="button"
      >
        <Plus className="mr-1 h-3 w-3" />
        Add option
      </Button>
    </div>
  );
}
