"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, BookOpen, MessageSquareText, RotateCcw, Send, Volume2, VolumeX, X, ListTree } from "lucide-react";
import CurriculumSidebar from "@/components/CurriculumSidebar";
import VoiceOrb from "@/components/VoiceOrb";
import MicButton from "@/components/MicButton";
import TranscriptPanel, { type ChatMessage } from "@/components/TranscriptPanel";
import IeltsTimer from "@/components/IeltsTimer";
import { useSpeech } from "@/hooks/useSpeech";
import { useProgress } from "@/hooks/useProgress";
import { type LessonStage } from "@/lib/prompt";
import { getPhase, getUnit } from "@/lib/curriculum";
import type { TutorState } from "@/hooks/useSpeech";

const QUIZ_TURN_THRESHOLD = 5;
const COMPLETE_SUGGESTION_TURN = 7;
const HELP_PATTERN = /(help me|confused|don'?t understand|did not understand|bujhi|bujhte parchi|bujhina|explain in bengali|in bengali)/i;

export default function HomePage() {
  const progress = useProgress();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interim, setInterim] = useState("");
  const [showTranscript, setShowTranscript] = useState(true);
  const [typed, setTyped] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [turnsInUnit, setTurnsInUnit] = useState(0);
  const [completeHint, setCompleteHint] = useState(false);

  const greetingsDoneForUnit = useRef<number | null>(null);
  const busyRef = useRef(false);

  const handleFinalTranscript = useCallback((text: string) => {
    void sendToTutor(text);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const speech = useSpeech({
    onFinalTranscript: handleFinalTranscript,
    onInterimTranscript: setInterim
  });

  useEffect(() => {
    if (!progress.hydrated) return;
    if (greetingsDoneForUnit.current === progress.currentUnitId) return;
    greetingsDoneForUnit.current = progress.currentUnitId;
    setMessages([]);
    setInterim("");
    setTurnsInUnit(0);
    setCompleteHint(false);
    void sendToTutor("__greet__", true);
  }, [progress.hydrated, progress.currentUnitId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sendToTutor(rawText: string, isGreeting = false) {
    if (busyRef.current) return;
    const isUserTurn = !isGreeting;
    if (isUserTurn && !rawText.trim()) return;

    busyRef.current = true;
    const userMessage: ChatMessage | null = isGreeting
      ? null
      : { id: crypto.randomUUID(), role: "user", text: rawText.trim() };

    setMessages((prev) => (userMessage ? [...prev, userMessage] : prev));
    setInterim("");
    speech.setState("thinking");

    const stage: LessonStage = turnsInUnit >= QUIZ_TURN_THRESHOLD ? "quiz" : "teach";
    const askingForHelp = !isGreeting && HELP_PATTERN.test(rawText);

    const history = [
      ...messages,
      ...(userMessage ? [userMessage] : [])
    ].map((m) => ({ role: m.role, content: m.text }));

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: isGreeting ? [] : history,
          unit: {
            id: progress.currentUnitId,
            stage,
            completed: progress.completedUnits.includes(progress.currentUnitId),
            askingForHelp,
            learnerName: progress.learnerName || undefined
          }
        })
      });
      const data = (await res.json()) as { reply?: string; error?: string; mode?: string };
      const reply = data.reply ?? data.error ?? "Sorry, something went wrong. Could you try again?";

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: reply
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (isUserTurn) {
        setTurnsInUnit((t) => t + 1);
        if (turnsInUnit + 1 >= COMPLETE_SUGGESTION_TURN) setCompleteHint(true);
      }
      await speech.speak(reply);
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "I could not reach my AI brain. Please check your connection and OPENAI_API_KEY in the .env file."
      };
      setMessages((prev) => [...prev, errMsg]);
      speech.setState("idle");
    } finally {
      busyRef.current = false;
    }
  }

  const handleTranslate = useCallback(async (messageId: string) => {
    setMessages((prev) => prev);
    const target = messages.find((m) => m.id === messageId);
    if (!target) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, translating: true } : m))
    );
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: target.text })
      });
      const data = (await res.json()) as { bengali?: string; error?: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, bengali: data.bengali ?? data.error ?? "Translation unavailable.", translating: false }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, bengali: "Translation failed. Try again.", translating: false } : m
        )
      );
    }
  }, [messages]);

  const translatingIds = new Set(
    messages.filter((m) => m.translating).map((m) => m.id)
  );

  const handlePushStart = () => speech.startListening();
  const handlePushEnd = () => speech.stopListening();

  const submitTyped = () => {
    const text = typed.trim();
    if (!text || busyRef.current) return;
    setTyped("");
    void sendToTutor(text);
  };

  const unit = progress.currentUnit;
  const phase = getPhase(unit.phase);
  const listening = speech.state === "listening";

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block w-80 shrink-0 h-full">
        <CurriculumSidebar
          currentUnitId={progress.currentUnitId}
          completedUnits={progress.completedUnits}
          notes={progress.notes}
          onSelectUnit={(id) => {
            const selected = getUnit(id);
            if (selected) progress.selectUnit(selected);
          }}
          onSaveNote={progress.saveNote}
          progressPercent={progress.progressPercent}
        />
      </div>

      {showSidebar && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-80 max-w-[85%] h-full">
            <CurriculumSidebar
              currentUnitId={progress.currentUnitId}
              completedUnits={progress.completedUnits}
              notes={progress.notes}
              onSelectUnit={(id) => {
                const selected = getUnit(id);
                if (selected) progress.selectUnit(selected);
                setShowSidebar(false);
              }}
              onSaveNote={progress.saveNote}
              progressPercent={progress.progressPercent}
            />
          </div>
          <button
            type="button"
            aria-label="Close curriculum"
            onClick={() => setShowSidebar(false)}
            className="flex-1 bg-black/60"
          />
        </div>
      )}

      <main className="flex-1 flex flex-col h-full min-w-0">
        <header className="flex items-center gap-3 border-b border-slate-800 bg-slate-950/90 px-4 py-3">
          <button
            type="button"
            onClick={() => setShowSidebar(true)}
            className="lg:hidden flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 border border-slate-800"
          >
            <ListTree size={14} /> Units
          </button>
          <div className="flex-1 min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-white truncate">
              <BookOpen size={14} className="text-brand-400 shrink-0" />
              Phase {unit.phase} · Unit {unit.id}: {unit.title}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{phase?.goal}</p>
          </div>
          <button
            type="button"
            onClick={() => speech.setMuted(!speech.muted)}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            aria-label={speech.muted ? "Unmute tutor voice" : "Mute tutor voice"}
          >
            {speech.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className={`rounded-lg p-2 ${showTranscript ? "text-brand-400 bg-brand-600/15" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"}`}
            aria-label="Toggle live transcript"
          >
            <MessageSquareText size={16} />
          </button>
        </header>

        {speech.error && (
          <div className="flex items-center gap-2 bg-red-950/70 text-red-200 px-4 py-2 text-xs">
            <AlertCircle size={13} />
            {speech.error}
            <button
              type="button"
              onClick={speech.clearError}
              className="ml-auto text-red-300 hover:text-white"
              aria-label="Dismiss error"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="flex-1 flex min-h-0 flex-col">
          <div
            className={`flex flex-col items-center justify-center transition-all ${
              showTranscript ? "py-8 basis-[45%] shrink-0" : "flex-1"
            }`}
          >
            <VoiceOrb state={speech.state as TutorState} />
            <p className="mt-6 max-w-md px-4 text-center text-xs text-slate-500">
              {unit.topic}
            </p>

            {unit.kind === "ielts_part2" && (
              <div className="mt-6 w-full max-w-md px-4">
                <IeltsTimer
                  visible
                  phaseLabel={`Unit ${unit.id} practice`}
                />
              </div>
            )}

            {completeHint && !progress.completedUnits.includes(unit.id) && (
              <button
                type="button"
                onClick={() => progress.markComplete(unit.id)}
                className="mt-5 flex items-center gap-1.5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 px-4 py-1.5 text-xs font-medium text-white"
              >
                Mark Unit {unit.id} complete
              </button>
            )}
            {progress.completedUnits.includes(unit.id) && (
              <button
                type="button"
                onClick={() => progress.markIncomplete(unit.id)}
                className="mt-5 flex items-center gap-1.5 rounded-full border border-emerald-700/60 px-4 py-1.5 text-xs text-emerald-300 hover:bg-emerald-900/30"
              >
                <RotateCcw size={11} /> Completed — tap to redo
              </button>
            )}

            <div className="mt-8">
              <MicButton
                state={speech.state as TutorState}
                mode={speech.mode}
                supported={speech.supported}
                listening={listening}
                onPushStart={handlePushStart}
                onPushEnd={handlePushEnd}
              />
            </div>

            {speech.mode === "push" && speech.supported && !listening && (
              <button
                type="button"
                onClick={() => speech.toggleMode()}
                className="mt-4 text-xs text-slate-500 hover:text-brand-300 underline-offset-2 hover:underline"
              >
                Switch to auto-listen
              </button>
            )}
          </div>

          {showTranscript && (
            <>
              <TranscriptPanel
                messages={messages}
                open
                interim={interim}
                onSpeak={(text) => void speech.speak(text)}
                onTranslate={handleTranslate}
                translatingIds={translatingIds}
              />
              <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 flex gap-2">
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitTyped()}
                  placeholder={
                    speech.supported
                      ? "Or type here to Alex…"
                      : "Mic not supported here — type your answer instead…"
                  }
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={submitTyped}
                  disabled={!typed.trim()}
                  className="rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 px-4 flex items-center text-white"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
