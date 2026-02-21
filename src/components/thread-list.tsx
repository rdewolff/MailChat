"use client";

import { Search } from "lucide-react";

import { CategoryBadge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { MailThread } from "@/lib/domain";

interface ThreadListProps {
  threads: MailThread[];
  selectedThreadId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelectThread: (threadId: string) => void;
}

export function ThreadList({ threads, selectedThreadId, query, onQueryChange, onSelectThread }: ThreadListProps) {
  return (
    <aside className="mail-panel flex h-full min-w-0 flex-col overflow-hidden border-r border-[var(--border-subtle)]">
      <div className="border-b border-[var(--border-subtle)] p-4">
        <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--text-primary)]">MailChat</h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Email as chat. Fast, summarized, actionable.</p>
        <label className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-sm">
          <Search className="size-4 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search threads..."
            className="w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </label>
      </div>

      <div className="overflow-y-auto p-2">
        {threads.map((thread) => {
          const isSelected = thread.id === selectedThreadId;

          return (
            <button
              type="button"
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              className={cn(
                "mb-1 w-full rounded-xl border px-3 py-3 text-left transition-all",
                isSelected
                  ? "border-[var(--brand-300)] bg-[var(--brand-50)] shadow-sm"
                  : "border-transparent bg-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--surface-2)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{thread.contactName}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">{thread.contactEmail}</p>
                </div>
                <p className="shrink-0 text-xs text-[var(--text-muted)]">{formatRelativeTime(thread.lastMessageAt)}</p>
              </div>

              <p className="mt-2 max-h-10 overflow-hidden text-xs leading-relaxed text-[var(--text-secondary)]">
                {thread.lastSummaryPreview}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <CategoryBadge category={thread.category} />
                {thread.unreadCount > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--brand-600)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {thread.unreadCount}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
