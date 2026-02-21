"use client";

import { CategoryBadge } from "@/components/ui/badge";
import type { MailMessage } from "@/lib/domain";

interface DetailPanelProps {
  message: MailMessage | null;
  open: boolean;
}

export function DetailPanel({ message, open }: DetailPanelProps) {
  return (
    <aside
      className={`mail-panel border-l border-[var(--border-subtle)] transition-[max-width,opacity] duration-200 ${
        open ? "max-w-md opacity-100" : "max-w-0 opacity-0"
      } overflow-hidden`}
    >
      <div className="h-full w-[20rem] overflow-y-auto p-4">
        {!message ? (
          <p className="text-sm text-[var(--text-muted)]">Select a message to inspect original details.</p>
        ) : (
          <div>
            <p className="font-display text-base font-semibold text-[var(--text-primary)]">Email Details</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Raw content and metadata stay accessible.</p>

            <div className="mt-4 space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">From</p>
                <p className="text-xs text-[var(--text-primary)]">{message.fromAddress}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">To</p>
                <p className="text-xs text-[var(--text-primary)]">{message.toAddresses.join(", ")}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Subject</p>
                <p className="text-xs text-[var(--text-primary)]">{message.subject}</p>
              </div>
              <div className="flex items-center gap-2">
                <CategoryBadge category={message.classification.category} />
                <span className="text-[11px] text-[var(--text-muted)]">
                  Confidence {Math.round(message.classification.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-white p-3">
              <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Original Body</p>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[var(--text-primary)]">{message.bodyText}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
              <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Action Items</p>
              {message.summary.actionItems.length === 0 ? (
                <p className="mt-2 text-xs text-[var(--text-muted)]">No action items extracted.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {message.summary.actionItems.map((item) => (
                    <li key={item} className="text-xs text-[var(--text-primary)]">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
