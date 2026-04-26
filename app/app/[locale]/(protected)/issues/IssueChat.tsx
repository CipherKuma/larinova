"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  sender_role: "doctor" | "admin";
  body: string;
  created_at: string;
};

export function IssueChat({
  issueId,
  initial,
}: {
  issueId: string;
  initial: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initial);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function refresh() {
      fetch(`/api/issues/${issueId}`)
        .then((r) => r.json())
        .then((d) => setMessages(d.messages ?? []))
        .catch(() => {});
    }
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [issueId]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setDraft("");
        const refreshed = await fetch(`/api/issues/${issueId}`).then((r) =>
          r.json(),
        );
        setMessages(refreshed.messages ?? []);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              "flex " +
              (m.sender_role === "doctor" ? "justify-end" : "justify-start")
            }
          >
            <div
              className={
                "max-w-[80%] rounded-lg p-3 text-sm " +
                (m.sender_role === "doctor"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground border border-border rounded-bl-sm")
              }
            >
              <div className="text-[10px] uppercase tracking-widest mb-1 opacity-70">
                {m.sender_role === "doctor" ? "You" : "Larinova"}
              </div>
              <div className="whitespace-pre-wrap">{m.body}</div>
              <div className="text-[10px] opacity-60 mt-1">
                {new Date(m.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8">
            No replies yet. We&apos;ll get back to you here.
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3">
        <div className="relative flex flex-col rounded-md border border-input bg-card shadow-sm focus-within:ring-1 focus-within:ring-ring/40">
          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              const ta = e.currentTarget;
              ta.style.height = "auto";
              ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Reply…"
            className="min-h-[52px] max-h-[160px] resize-none border-0 bg-transparent px-4 pt-3.5 pb-12 text-sm focus-visible:outline-none leading-relaxed"
          />
          <Button
            type="button"
            onClick={send}
            disabled={sending || draft.trim().length === 0}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-md p-0"
          >
            ↑
          </Button>
        </div>
      </div>
    </div>
  );
}
