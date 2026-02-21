"use client";

import { Eye, EyeOff, Info, Sparkles } from "lucide-react";

import type { MailMessage, MailThread } from "@/lib/domain";
import { cn, formatRelativeTime } from "@/lib/utils";

interface ChatPanelProps {
  thread: MailThread | null;
  messages: MailMessage[];
  summaryMode: boolean;
  onToggleSummary: () => void;
  onSelectMessage: (message: MailMessage) => void;
  onToggleDetails: () => void;
}

export function ChatPanel({
  thread,
  messages,
  summaryMode,
  onToggleSummary,
  onSelectMessage,
  onToggleDetails,
}: ChatPanelProps) {
  if (!thread) {
    return (
      <section className="mail-panel flex h-full items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-[var(--text-primary)]">No thread selected</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Use `J/K` to navigate and `Enter` to open a thread.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mail-panel flex h-full min-w-0 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold text-[var(--text-primary)]">{thread.contactName}</p>
          <p className="truncate text-xs text-[var(--text-muted)]">{thread.subject}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
            onClick={onToggleSummary}
          >
            {summaryMode ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {summaryMode ? "Summary" : "Original"}
          </button>

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
            onClick={onToggleDetails}
          >
            <Info className="size-4" />
          </button>
        </div>
      </header>

      <div className="mail-grid-bg flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {messages.map((message) => {
            const inbound = message.direction === "INBOUND";

            return (
              <button
                key={message.id}
                type="button"
                onClick={() => onSelectMessage(message)}
                className={cn(
                  "group max-w-[85%] rounded-2xl border px-4 py-3 text-left shadow-[0_12px_35px_-28px_rgba(0,0,0,0.55)] transition-transform hover:-translate-y-0.5",
                  inbound
                    ? "mr-auto border-[var(--border-subtle)] bg-white"
                    : "ml-auto border-[var(--brand-500)] bg-[var(--brand-600)] text-white",
                )}
              >
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    inbound ? "text-[var(--text-primary)]" : "text-white/95",
                  )}
                >
                  {summaryMode ? message.summary.summary : message.bodyText}
                </p>

                {summaryMode ? (
                  <p className={cn("mt-2 inline-flex items-center gap-1 text-[11px]", inbound ? "text-[var(--text-muted)]" : "text-white/70")}>
                    <Sparkles className="size-3" />
                    AI gist
                  </p>
                ) : null}

                <p className={cn("mt-2 text-[11px]", inbound ? "text-[var(--text-muted)]" : "text-white/70")}>
                  {formatRelativeTime(message.sentAt)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
