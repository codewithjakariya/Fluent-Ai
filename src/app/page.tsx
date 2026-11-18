"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  MessageSquareText,
  Play,
  RotateCcw,
  Send,
  Volume2,
  VolumeX,
  X,
  ListTree,
  Zap,
  FlaskConical,
  Gauge,
  ArrowRight
} from "lucide-react";
import CurriculumSidebar from "@/components/CurriculumSidebar";
import VoiceOrb from "@/components/VoiceOrb";
import MicButton from "@/components/MicButton";
import TranscriptPanel, { type ChatMessage } from "@/components/TranscriptPanel";
import IeltsTimer from "@/components/IeltsTimer";
import { useSpeech } from "@/hooks/useSpeech";
import { useProgress } from "@/hooks/useProgress";
import { type LessonStage } from "@/lib/prompt";
import { getPhase, getUnit, getLesson, lessonKey } from "@/lib/curriculum";
import type { TutorState } from "@/hooks/useSpeech";

const QUIZ_TURN_THRESHOLD = 5;
const COMPLETE_SUGGESTION_TURN = 6;
const HELP_PATTERN = /(help me|confused|don'?t understand|did not understand|bujhi|bujhte parchi|bujhina|explain in bengali|in bengali)/i;

const SPEED_OPTIONS = [
  { label: "Slow", value: 0.7 },
  { label: "Clear", value: 0.85 },
  { label: "Normal", value: 1.0 }
];

type SessionState = "ready" | "active";
type TutorMode = "live" | "demo" | null;

export default function HomePage() {
  const progress = useProgress();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interim, setInterim] = useState("");
  const [showTranscript, setShowTranscript] = useState(true);
  const [typed, setTyped] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [turnsInUnit, setTurnsInUnit] = useState(0);
  const [sessionReadyHint, setSessionReadyHint] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>("ready");
  const [tutorMode, setTutorMode] = useState<TutorMode>(null);

  const busyRef = useRef(false);
  const sessionStateRef = useRef<SessionState>("ready");
  sessionStateRef.current = sessionState;
  const sendRef = useRef<((text: string, greeting?: boolean) => Promise<void>) | null>(null);

  const handleFinalTranscript = useCallback((text: string) => {
    if (sessionStateRef.current !== "active") return;
    void sendRef.current?.(text);
  }, []);

  const speech = useSpeech({
    onFinalTranscript: handleFinalTranscript,
    onInterimTranscript: setInterim
  });
  const speechRef = useRef(speech);
  speechRef.current = speech;

  useEffect(() => {
    speech.setRate(progress.speechRate);
  }, [progress.speechRate, speech]);

  const unit = progress.currentUnit;
  const lesson = getLesson(progress.currentUnitId, progress.currentLessonId) ?? unit.lessons[0];
  const phase = getPhase(unit.phase);
  const isUnitDone = progress.completedUnits.includes(unit.id);
  const isLessonDone = !!progress.completedLessons[lessonKey(unit.id, lesson.id)];
  const unitLessonDoneCount = unit.lessons.filter(
    (l) => progress.completedLessons[lessonKey(unit.id, l.id)]
  ).length;
  const allLessonsDone = unitLessonDoneCount === unit.lessons.length;
  const lessonPercent = Object.values(progress.completedLessons).filter(Boolean).length;
  const nextLesson = unit.lessons.find(
    (l) => l.id > lesson.id && !progress.completedLessons[lessonKey(unit.id, l.id)]
  );
  const stageLabel: LessonStage = turnsInUnit >= QUIZ_TURN_THRESHOLD ? "quiz" : "teach";

  const sendToTutor = useCallback(
    async (rawText: string, isGreeting = false) => {
      if (busyRef.current) return;
      const isUserTurn = !isGreeting;
      if (isUserTurn && !rawText.trim()) return;

      busyRef.current = true;
      const userMessage: ChatMessage | null = isGreeting
        ? null
        : { id: crypto.randomUUID(), role: "user", text: rawText.trim() };

      setMessages((prev) => (userMessage ? [...prev, userMessage] : prev));
      setInterim("");
      speechRef.current?.setState("thinking");

      const askingForHelp = !isGreeting && HELP_PATTERN.test(rawText);

      const history = [...messages, ...(userMessage ? [userMessage] : [])].map((m) => ({
        role: m.role,
        content: m.text
      }));

      try {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: isGreeting ? [] : history,
            unit: {
              id: progress.currentUnitId,
              lessonId: progress.currentLessonId,
              stage: turnsInUnit >= QUIZ_TURN_THRESHOLD ? "quiz" : "teach",
              completed: isLessonDone,
              askingForHelp,
              learnerName: progress.learnerName || undefined
            }
          })
        });
        const data = (await res.json()) as { reply?: string; error?: string; mode?: TutorMode };
        const reply = data.reply ?? data.error ?? "Sorry, something went wrong. Could you try again?";
        if (data.mode) setTutorMode(data.mode);

        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: reply
        };
        setMessages((prev) => [...prev, aiMessage]);
        if (isUserTurn) {
          setTurnsInUnit((t) => t + 1);
          if (turnsInUnit + 1 >= COMPLETE_SUGGESTION_TURN) setSessionReadyHint(true);
        }
        await speechRef.current?.speak(reply);
      } catch {
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "I could not reach my AI brain. Please check your connection and your GROQ_API_KEY in the .env file."
        };
        setMessages((prev) => [...prev, errMsg]);
        speechRef.current?.setState("ready");
      } finally {
        busyRef.current = false;
      }
    },
    [messages, progress, turnsInUnit, isLessonDone] // eslint-disable-line react-hooks/exhaustive-deps
  );
  sendRef.current = sendToTutor;

  const resetSessionUi = useCallback(() => {
    setMessages([]);
    setInterim("");
    setTurnsInUnit(0);
    setSessionReadyHint(false);
  }, []);

  const startSession = useCallback(() => {
    resetSessionUi();
    setSessionState("active");
    void sendRef.current?.("__greet__", true);
  }, [resetSessionUi]);

  const handleSelectLesson = useCallback(
    (unitId: number, lessonId: number) => {
      setShowSidebar(false);
      if (unitId === progress.currentUnitId && lessonId === progress.currentLessonId) return;
      progress.selectLesson(unitId, lessonId);
      speechRef.current?.stopSpeaking();
      speechRef.current?.setState("ready");
      resetSessionUi();
      setSessionState("ready");
    },
    [progress, resetSessionUi]
  );

  const goToNextLesson = useCallback(() => {
    const current = getUnit(progress.currentUnitId);
    const target =
      current?.lessons.find((l) => l.id > lesson.id) ?? current?.lessons[0];
    if (target) progress.selectLesson(progress.currentUnitId, target.id);
    speechRef.current?.setState("ready");
    resetSessionUi();
    setSessionState("ready");
  }, [lesson.id, progress, resetSessionUi]);

  const handleTranslate = useCallback(
    async (messageId: string) => {
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
    },
    [messages]
  );

  useEffect(() => {
    if (speech.mode !== "push") return;
    const isTypingTarget = (e: KeyboardEvent) =>
      e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !isTypingTarget(e)) {
        e.preventDefault();
        if (sessionStateRef.current === "active") speech.startListening();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTypingTarget(e)) {
        e.preventDefault();
        speech.stopListening();
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [speech]);

  const submitTyped = () => {
    const text = typed.trim();
    if (!text || busyRef.current) return;
    setTyped("");
    void sendToTutor(text);
  };

  const listening = speech.state === "listening";

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block w-80 shrink-0 h-full">
        <CurriculumSidebar
          currentUnitId={progress.currentUnitId}
          currentLessonId={progress.currentLessonId}
          completedUnits={progress.completedUnits}
          completedLessons={progress.completedLessons}
          notes={progress.notes}
          onSelectLesson={handleSelectLesson}
          onSaveNote={progress.saveNote}
          progressPercent={progress.progressPercent}
          lessonPercent={lessonPercent}
        />
      </div>

      {showSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="w-80 max-w-[85%] h-full">
            <CurriculumSidebar
              currentUnitId={progress.currentUnitId}
              currentLessonId={progress.currentLessonId}
              completedUnits={progress.completedUnits}
              completedLessons={progress.completedLessons}
              notes={progress.notes}
              onSelectLesson={handleSelectLesson}
              onSaveNote={progress.saveNote}
              progressPercent={progress.progressPercent}
              lessonPercent={lessonPercent}
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
        <header className="flex items-center gap-3 border-b border-white/5 bg-ink-950/90 px-4 py-3">
          <button
            type="button"
            onClick={() => setShowSidebar(true)}
            className="lg:hidden flex items-center gap-1.5 rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs text-ink-300 border border-white/5"
          >
            <ListTree size={14} /> Units
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white truncate">
                <BookOpen size={14} className="text-brand-400 shrink-0" />
                Phase {unit.phase} · Unit {unit.id}.{lesson.id}: {lesson.title}
              </h2>
              {(isLessonDone || isUnitDone) && (
                <span className="flex items-center gap-1 rounded-full bg-success-500/15 border border-success-500/25 px-2 py-0.5 text-[10px] font-semibold text-success-300">
                  <CheckCircle2 size={10} /> {isUnitDone ? "UNIT COMPLETED" : "LESSON DONE"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-ink-500 truncate">
              {unit.title} · {unitLessonDoneCount}/{unit.lessons.length} lessons · {phase?.title}
            </p>
          </div>

          {sessionState === "active" && (
            <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/5 bg-ink-900 px-2.5 py-1 text-[10px] font-medium tracking-wide text-ink-300">
              {stageLabel === "quiz" ? (
                <FlaskConical size={11} className="text-gold-400" />
              ) : (
                <Zap size={11} className="text-brand-400" />
              )}
              {stageLabel === "quiz" ? "QUIZ" : "LESSON"}
            </span>
          )}

          {tutorMode && sessionState === "active" && (
            <span
              className={`hidden md:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide ${
                tutorMode === "live"
                  ? "border-success-500/25 bg-success-500/10 text-success-300"
                  : "border-gold-500/25 bg-gold-500/10 text-gold-300"
              }`}
            >
              {tutorMode === "live" ? "AI CONNECTED" : "DEMO MODE"}
            </span>
          )}

          <button
            type="button"
            onClick={() => speech.setMuted(!speech.muted)}
            className="rounded-lg p-2 text-ink-400 hover:text-ink-100 hover:bg-ink-900"
            aria-label={speech.muted ? "Unmute tutor voice" : "Mute tutor voice"}
          >
            {speech.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className={`rounded-lg p-2 ${showTranscript ? "text-brand-300 bg-brand-500/10" : "text-ink-400 hover:text-ink-100 hover:bg-ink-900"}`}
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
              showTranscript ? "py-8 basis-[48%] shrink-0" : "flex-1"
            }`}
          >
            {sessionState === "ready" ? (
              <div className="flex flex-col items-center gap-7 animate-fade-up">
                <VoiceOrb state="ready" />
                <div className="max-w-lg px-6 text-center">
                  <h3 className="text-base font-semibold text-white">
                    Lesson {unit.id}.{lesson.id} — {lesson.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-400 leading-relaxed">{lesson.goal}</p>
                  <p className="mt-2 text-xs text-ink-500">
                    {unit.title} · Phase {unit.phase} · questions ramp from simple to advanced, IELTS-style in Phase 4.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startSession}
                  className="flex items-center gap-2.5 rounded-full bg-brand-600 hover:bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-glow transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Play size={18} />
                  Start Session
                </button>

                <div className="flex items-center gap-2.5 rounded-full border border-white/5 bg-ink-900/70 px-3 py-1.5">
                  <Gauge size={13} className="text-ink-400" />
                  <span className="text-[11px] text-ink-400">Alex speaks:</span>
                  {SPEED_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => progress.setSpeechRate(option.value)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                        progress.speechRate === option.value
                          ? "bg-brand-600 text-white"
                          : "text-ink-400 hover:text-ink-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-ink-500">
                  Alex will ask his first question — answer with Push to Talk.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-fade-up">
                <VoiceOrb state={speech.state as TutorState} />

                {unit.kind === "ielts_part2" && (
                  <div className="mt-10 w-full max-w-md px-4">
                    <IeltsTimer visible phaseLabel={`Lesson ${unit.id}.${lesson.id}`} />
                  </div>
                )}

                <div className="mt-9">
                  <MicButton
                    state={speech.state as TutorState}
                    supported={speech.supported}
                    listening={listening}
                    onPushStart={() => speech.startListening()}
                    onPushEnd={() => speech.stopListening()}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => speech.toggleMode()}
                  className="mt-4 text-[11px] text-ink-500 hover:text-brand-300 underline-offset-2 hover:underline"
                >
                  {speech.mode === "push" ? "Switch to auto-listen mode" : "Switch back to Push to Talk"}
                </button>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                  {sessionReadyHint && !isLessonDone && (
                    <button
                      type="button"
                      onClick={() => progress.markLessonComplete(unit.id, lesson.id)}
                      className="flex items-center gap-1.5 rounded-full bg-success-600 hover:bg-success-500 px-4 py-1.5 text-xs font-semibold text-white shadow-glow-success transition-colors"
                    >
                      <CheckCircle2 size={12} /> Mark Lesson {unit.id}.{lesson.id} complete
                    </button>
                  )}
                  {isLessonDone && !isUnitDone && (
                    <button
                      type="button"
                      onClick={goToNextLesson}
                      className="flex items-center gap-1.5 rounded-full bg-brand-600 hover:bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white transition-colors"
                    >
                      {nextLesson ? `Next: ${nextLesson.title}` : "Restart unit lessons"} <ArrowRight size={12} />
                    </button>
                  )}
                  {allLessonsDone && !isUnitDone && (
                    <button
                      type="button"
                      onClick={() => progress.markComplete(unit.id)}
                      className="flex items-center gap-1.5 rounded-full bg-success-600 hover:bg-success-500 px-4 py-1.5 text-xs font-semibold text-white shadow-glow-success transition-colors"
                    >
                      <CheckCircle2 size={12} /> Complete Unit {unit.id}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={startSession}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-900 hover:bg-ink-800 px-4 py-1.5 text-xs text-ink-300 transition-colors"
                  >
                    <RotateCcw size={11} /> Restart session
                  </button>
                </div>
              </div>
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
                translatingIds={new Set(messages.filter((m) => m.translating).map((m) => m.id))}
              />
              <div className="border-t border-white/5 bg-ink-950 px-4 py-3 flex gap-2">
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitTyped()}
                  placeholder={
                    speech.supported
                      ? "Or type your answer here…"
                      : "Mic not supported in this browser — type your answer instead…"
                  }
                  className="flex-1 rounded-xl bg-ink-900 border border-white/5 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-600 focus:border-brand-500/50"
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
