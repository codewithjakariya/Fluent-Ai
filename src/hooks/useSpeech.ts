"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ---- Minimal SpeechRecognition typings (not in the standard TS DOM lib) ----

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
}

interface SpeechRecognitionLike extends EventSource {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ---- ElevenLabs client slot (uses NEXT_PUBLIC_ELEVENLABS_* from .env) ----

async function speakWithElevenLabs(text: string, apiKey: string, voiceId: string): Promise<void> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs TTS failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  await new Promise<void>((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Audio playback failed"));
    void audio.play();
  });
  URL.revokeObjectURL(url);
}

function speakWithBrowser(text: string, onDone: () => void): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onDone();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const hasBengali = /[\u0980-\u09FF]/.test(text);
  utterance.lang = hasBengali ? "bn-BD" : "en-US";
  utterance.rate = hasBengali ? 0.95 : 1;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang.toLowerCase().startsWith(hasBengali ? "bn" : "en"));
  if (match) utterance.voice = match;
  utterance.onend = onDone;
  utterance.onerror = onDone;
  window.speechSynthesis.speak(utterance);
}

// ---- Hook ----

export type TutorState = "ready" | "listening" | "thinking" | "speaking";
export type ListenMode = "push" | "auto";

export interface UseSpeechOptions {
  onFinalTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
}

export function useSpeech({ onFinalTranscript, onInterimTranscript }: UseSpeechOptions) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<TutorState>("ready");
  const [mode, setMode] = useState<ListenMode>("push");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const listeningRef = useRef(false);
  const wantListeningRef = useRef(false);
  const speakingRef = useRef(false);
  const modeRef = useRef<ListenMode>("push");
  const mutedRef = useRef(false);
  const elevenLabs = useRef<{ key: string; voiceId: string }>({
    key: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ?? "",
    voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID ?? ""
  });

  modeRef.current = mode;
  mutedRef.current = muted;

  const onFinalRef = useRef(onFinalTranscript);
  const onInterimRef = useRef(onInterimTranscript);
  onFinalRef.current = onFinalTranscript;
  onInterimRef.current = onInterimTranscript;

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listeningRef.current = true;
      setError(null);
      if (!speakingRef.current) setState("listening");
    };

    recognition.onresult = (event) => {
      if (speakingRef.current) return;
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript?.trim() ?? "";
        if (!text) continue;
        if (result.isFinal) {
          onFinalRef.current(text);
        } else {
          interim += `${text} `;
        }
      }
      if (interim && onInterimRef.current) onInterimRef.current(interim.trim());
    };

    recognition.onerror = (event) => {
      listeningRef.current = false;
      const code = event.error;
      if (code === "no-speech" || code === "aborted") return;
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Microphone permission denied. Allow mic access in your browser, then try again.");
      } else if (code === "network") {
        setError("Speech recognition needs a network connection.");
      } else {
        setError(`Speech recognition error: ${code ?? "unknown"}`);
      }
    };

    recognition.onend = () => {
      listeningRef.current = false;
      if (wantListeningRef.current && !speakingRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // start() can throw if called too quickly; fall through
        }
      }
      setState((s) => (s === "listening" ? "ready" : s));
    };

    recognitionRef.current = recognition;
    return () => {
      wantListeningRef.current = false;
      listeningRef.current = false;
      try {
        recognition.abort();
      } catch {
        // already stopped
      }
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || speakingRef.current) return;
    setError(null);
    wantListeningRef.current = true;
    if (!listeningRef.current) {
      try {
        recognition.start();
      } catch {
        // already started
      }
    }
    setState("listening");
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    wantListeningRef.current = false;
    if (recognition && listeningRef.current) {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    }
    setState("ready");
  }, []);

  const speak = useCallback(async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    if (mutedRef.current) return;
    speakingRef.current = true;
    setState("speaking");
    try {
      const { key, voiceId } = elevenLabs.current;
      if (key && voiceId) {
        await speakWithElevenLabs(clean, key, voiceId);
      } else {
        await new Promise<void>((resolve) => speakWithBrowser(clean, resolve));
      }
    } catch {
      await new Promise<void>((resolve) => speakWithBrowser(clean, resolve));
    } finally {
      speakingRef.current = false;
      if (wantListeningRef.current && modeRef.current === "auto") {
        setState("listening");
        const recognition = recognitionRef.current;
        if (recognition && !listeningRef.current) {
          try {
            recognition.start();
          } catch {
            // ignore
          }
        }
      } else {
        setState(wantListeningRef.current ? "listening" : "ready");
      }
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    speakingRef.current = false;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    document.querySelectorAll("audio").forEach((el) => el.pause());
    setState(wantListeningRef.current ? "listening" : "ready");
  }, []);

  const toggleMode = useCallback(() => {
    setMode((m) => {
      const next: ListenMode = m === "push" ? "auto" : "push";
      if (next === "auto") {
        startListening();
      } else {
        stopListening();
      }
      return next;
    });
  }, [startListening, stopListening]);

  return {
    supported,
    state,
    setState,
    mode,
    toggleMode,
    muted,
    setMuted,
    error,
    clearError: () => setError(null),
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
}
