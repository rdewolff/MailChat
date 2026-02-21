"use client";

import { Mic, Send, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useVoiceComposer } from "@/hooks/use-voice-composer";
import type { SendMessagePayload } from "@/lib/domain";

const toneOptions: Array<SendMessagePayload["optimizeTone"]> = ["neutral", "friendly", "direct", "executive"];

interface ComposerProps {
  disabled?: boolean;
  onSend: (payload: { body: string; optimizeTone?: SendMessagePayload["optimizeTone"] }) => Promise<void>;
}

export function Composer({ disabled, onSend }: ComposerProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [tone, setTone] = useState<SendMessagePayload["optimizeTone"]>("neutral");

  const voice = useVoiceComposer({
    onTranscript: (text) => {
      setValue(text);
    },
  });
  const toggleVoice = voice.toggleListening;

  const submit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    setSending(true);
    try {
      await onSend({ body: trimmed, optimizeTone: tone });
      setValue("");
    } finally {
      setSending(false);
    }
  }, [onSend, tone, value]);

  useEffect(() => {
    const triggerSend = () => {
      void submit();
    };

    const triggerVoice = () => {
      void toggleVoice();
    };

    window.addEventListener("mailchat:send", triggerSend);
    window.addEventListener("mailchat:voice", triggerVoice);

    return () => {
      window.removeEventListener("mailchat:send", triggerSend);
      window.removeEventListener("mailchat:voice", triggerVoice);
    };
  }, [submit, toggleVoice]);

  return (
    <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-1)] p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Write a reply. Cmd/Ctrl + Enter to send. Shift+V for voice."
          className="h-24 w-full resize-none rounded-2xl border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--brand-300)] transition focus:ring-2"
          disabled={disabled || sending}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-[var(--border-subtle)] bg-white p-1">
              {toneOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  className={`rounded-lg px-2 py-1 text-xs font-medium capitalize transition ${
                    option === tone ? "bg-[var(--brand-100)] text-[var(--brand-700)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <Button
              variant="soft"
              size="sm"
              disabled={disabled || sending || voice.isUploading}
              onClick={() => {
                void voice.toggleListening();
              }}
            >
              <Mic className={`size-3.5 ${voice.isListening ? "text-rose-500" : ""}`} />
              {voice.isListening ? "Listening" : "Voice"}
            </Button>

            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <Sparkles className="size-3" />
              AI tone
            </span>
          </div>

          <Button onClick={() => void submit()} disabled={disabled || sending || !value.trim()}>
            <Send className="size-4" />
            Send
          </Button>
        </div>

        {voice.error ? <p className="text-xs text-rose-600">{voice.error}</p> : null}
      </div>
    </div>
  );
}
