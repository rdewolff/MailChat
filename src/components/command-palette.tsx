"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { CommandMenuAction } from "@/lib/domain";

interface CommandPaletteProps {
  open: boolean;
  actions: CommandMenuAction[];
  onClose: () => void;
}

export function CommandPalette({ open, actions, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return actions;
    }

    return actions.filter((action) => action.label.toLowerCase().includes(normalized));
  }, [actions, query]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 p-4 pt-24" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-2">
          <Search className="size-4 text-[var(--text-muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a command"
            className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.map((action) => (
            <button
              key={action.id}
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--surface-2)]"
              onClick={() => {
                action.run();
                onClose();
              }}
            >
              <span>{action.label}</span>
              {action.shortcut ? <span className="text-xs text-[var(--text-muted)]">{action.shortcut}</span> : null}
            </button>
          ))}

          {filtered.length === 0 ? <p className="px-3 py-6 text-sm text-[var(--text-muted)]">No matching commands.</p> : null}
        </div>
      </div>
    </div>
  );
}
