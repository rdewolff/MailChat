"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { MailMessage, MailThread, SendMessagePayload } from "@/lib/domain";

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export function useThreads() {
  return useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const payload = await fetchJson<{ threads: MailThread[] }>("/api/threads");
      return payload.threads;
    },
    refetchInterval: 10_000,
  });
}

export function useThreadMessages(threadId: string | null) {
  return useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: async () => {
      const payload = await fetchJson<{ messages: MailMessage[] }>(`/api/threads/${threadId}/messages`);
      return payload.messages;
    },
    enabled: Boolean(threadId),
    refetchInterval: 8_000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const data = await fetchJson<{ message: MailMessage }>("/api/messages/send", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return data.message;
    },
    onSuccess: async (message) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["threads"] }),
        queryClient.invalidateQueries({ queryKey: ["thread-messages", message.threadId] }),
      ]);
    },
  });
}

export function useIngestSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      threadId: string;
      fromAddress: string;
      toAddresses: string[];
      subject: string;
      bodyText: string;
    }) => {
      const data = await fetchJson<{ message: MailMessage }>("/api/ingest", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return data.message;
    },
    onSuccess: async (message) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["threads"] }),
        queryClient.invalidateQueries({ queryKey: ["thread-messages", message.threadId] }),
      ]);
    },
  });
}
