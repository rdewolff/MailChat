"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

interface SpeechRecognitionEvent {
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => Recognition;
    SpeechRecognition?: new () => Recognition;
  }
}

export function useVoiceComposer({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const recognitionSupported = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  const startRecognition = useCallback(() => {
    const ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!ctor) {
      return false;
    }

    const recognition = new ctor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();

      if (text) {
        onTranscript(text);
      }
    };

    recognition.onerror = () => {
      setError("Speech recognition failed. Try browser permissions or Whisperit fallback.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);

    return true;
  }, [onTranscript]);

  const startRecordingFallback = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsUploading(true);
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", blob, "recording.webm");

          const response = await fetch("/api/voice/transcribe", {
            method: "POST",
            body: formData,
          });

          const payload = (await response.json()) as { transcript?: string };
          if (payload.transcript) {
            onTranscript(payload.transcript);
          }
        } catch {
          setError("Voice upload failed. Check Whisperit configuration.");
        } finally {
          setIsUploading(false);
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      setIsListening(true);
    } catch {
      setError("Microphone permission denied.");
    }
  }, [onTranscript]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    setIsListening(false);
  }, []);

  const toggleListening = useCallback(async () => {
    setError(null);

    if (isListening) {
      stop();
      return;
    }

    if (recognitionSupported) {
      const started = startRecognition();
      if (started) {
        return;
      }
    }

    await startRecordingFallback();
  }, [isListening, recognitionSupported, startRecognition, startRecordingFallback, stop]);

  return {
    isListening,
    isUploading,
    recognitionSupported,
    error,
    toggleListening,
    stop,
  };
}
