"use client";

import { useCallback, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { ChatPanel } from "@/components/chat-panel";
import { CommandPalette } from "@/components/command-palette";
import { Composer } from "@/components/composer";
import { DetailPanel } from "@/components/detail-panel";
import { ThreadList } from "@/components/thread-list";
import { useIngestSimulation, useSendMessage, useThreadMessages, useThreads } from "@/hooks/use-mail-data";
import type { CommandMenuAction, MailMessage, MailThread } from "@/lib/domain";

const EMPTY_THREADS: MailThread[] = [];

export function MailChatApp() {
  const [search, setSearch] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MailMessage | null>(null);
  const [summaryMode, setSummaryMode] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const threadsQuery = useThreads();
  const sendMessage = useSendMessage();
  const ingestSimulation = useIngestSimulation();

  const threads = threadsQuery.data ?? EMPTY_THREADS;

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return threads;
    }

    return threads.filter((thread) => {
      return (
        thread.contactName.toLowerCase().includes(query) ||
        thread.contactEmail.toLowerCase().includes(query) ||
        thread.lastSummaryPreview.toLowerCase().includes(query)
      );
    });
  }, [search, threads]);

  const selectedThread = useMemo(() => {
    if (!selectedThreadId && filteredThreads[0]) {
      return filteredThreads[0];
    }

    return filteredThreads.find((thread) => thread.id === selectedThreadId) ?? null;
  }, [filteredThreads, selectedThreadId]);

  const selectedThreadMessages = useThreadMessages(selectedThread?.id ?? null);
  const messages = selectedThreadMessages.data ?? [];

  const selectRelativeThread = useCallback((direction: 1 | -1) => {
    if (filteredThreads.length === 0) {
      return;
    }

    const currentId = selectedThread?.id ?? filteredThreads[0].id;
    const currentIndex = filteredThreads.findIndex((thread) => thread.id === currentId);
    const nextIndex = (currentIndex + direction + filteredThreads.length) % filteredThreads.length;
    setSelectedThreadId(filteredThreads[nextIndex]?.id ?? filteredThreads[0].id);
    setSelectedMessage(null);
  }, [filteredThreads, selectedThread]);

  const sendReply = async (payload: { body: string; optimizeTone?: "neutral" | "friendly" | "direct" | "executive" }) => {
    if (!selectedThread) {
      return;
    }

    await sendMessage.mutateAsync({
      threadId: selectedThread.id,
      body: payload.body,
      optimizeTone: payload.optimizeTone,
    });
  };

  const commandActions = useMemo<CommandMenuAction[]>(() => {
    const activeThread: MailThread | null = selectedThread;

    return [
      {
        id: "toggle-summary",
        label: summaryMode ? "Switch to original email mode" : "Switch to summarized mode",
        shortcut: "S",
        run: () => setSummaryMode((value) => !value),
      },
      {
        id: "toggle-detail",
        label: detailsOpen ? "Hide email detail panel" : "Show email detail panel",
        shortcut: "D",
        run: () => setDetailsOpen((value) => !value),
      },
      {
        id: "jump-next",
        label: "Jump to next thread",
        shortcut: "J",
        run: () => selectRelativeThread(1),
      },
      {
        id: "jump-prev",
        label: "Jump to previous thread",
        shortcut: "K",
        run: () => selectRelativeThread(-1),
      },
      {
        id: "simulate-inbound",
        label: "Simulate inbound email",
        shortcut: "I",
        run: () => {
          if (!activeThread) {
            return;
          }

          void ingestSimulation.mutateAsync({
            threadId: activeThread.id,
            fromAddress: activeThread.contactEmail,
            toAddresses: ["you@mailchat.dev"],
            subject: activeThread.subject,
            bodyText: "Quick update: I approved the draft and expect final assets by this afternoon.",
          });
        },
      },
    ];
  }, [detailsOpen, ingestSimulation, selectedThread, selectRelativeThread, summaryMode]);

  useHotkeys("meta+k,ctrl+k", (event) => {
    event.preventDefault();
    setPaletteOpen((value) => !value);
  });

  useHotkeys("j", () => selectRelativeThread(1));
  useHotkeys("k", () => selectRelativeThread(-1));
  useHotkeys("s", () => setSummaryMode((value) => !value));
  useHotkeys("d", () => setDetailsOpen((value) => !value));
  useHotkeys("/", (event) => {
    event.preventDefault();
    const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Search threads..."]');
    searchInput?.focus();
  });

  useHotkeys("shift+v", () => {
    window.dispatchEvent(new Event("mailchat:voice"));
  });

  useHotkeys("meta+enter,ctrl+enter", () => {
    window.dispatchEvent(new Event("mailchat:send"));
  });

  return (
    <div className="h-[100dvh] w-full px-3 py-3 md:px-5 md:py-5">
      <div className="mail-surface mx-auto grid h-full w-full max-w-[1600px] grid-cols-1 overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-1)] shadow-[0_30px_90px_-40px_rgba(9,34,66,0.45)] md:grid-cols-[320px_1fr_auto]">
        <ThreadList
          threads={filteredThreads}
          selectedThreadId={selectedThread?.id ?? null}
          query={search}
          onQueryChange={setSearch}
          onSelectThread={(threadId) => {
            setSelectedThreadId(threadId);
            setSelectedMessage(null);
          }}
        />

        <div className="flex min-h-0 flex-col">
          <ChatPanel
            thread={selectedThread}
            messages={messages}
            summaryMode={summaryMode}
            onToggleSummary={() => setSummaryMode((value) => !value)}
            onSelectMessage={setSelectedMessage}
            onToggleDetails={() => setDetailsOpen((value) => !value)}
          />

          <Composer
            disabled={!selectedThread || sendMessage.isPending}
            onSend={sendReply}
          />
        </div>

        <DetailPanel
          open={detailsOpen}
          message={selectedMessage ?? messages[messages.length - 1] ?? null}
        />
      </div>

      <CommandPalette
        open={paletteOpen}
        actions={commandActions}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}
