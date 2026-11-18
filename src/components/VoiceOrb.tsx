"use client";

import type { TutorState } from "@/hooks/useSpeech";

const STATE_META: Record<TutorState, { label: string; ring: string; core: string }> = {
  idle: {
    label: "Ready",
    ring: "bg-brand-500/20",
    core: "bg-gradient-to-br from-brand-400 to-indigo-600"
  },
  listening: {
    label: "Listening…",
    ring: "bg-emerald-500/20",
    core: "bg-gradient-to-br from-emerald-400 to-teal-600"
  },
  thinking: {
    label: "Thinking…",
    ring: "bg-amber-500/20",
    core: "bg-gradient-to-br from-amber-400 to-orange-500"
  },
  speaking: {
    label: "Speaking…",
    ring: "bg-brand-500/30",
    core: "bg-gradient-to-br from-fuchsia-400 to-brand-600"
  }
};

const BARS: { height: string; delay: string }[] = [
  { height: "h-4", delay: "0ms" },
  { height: "h-8", delay: "120ms" },
  { height: "h-12", delay: "240ms" },
  { height: "h-16", delay: "360ms" },
  { height: "h-12", delay: "480ms" },
  { height: "h-8", delay: "600ms" },
  { height: "h-4", delay: "720ms" }
];

export default function VoiceOrb({ state }: { state: TutorState }) {
  const meta = STATE_META[state];
  const active = state === "listening" || state === "speaking";

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <div className="relative flex items-center justify-center w-56 h-56">
        <div
          className={`absolute inset-0 rounded-full ${meta.ring} transition-colors duration-500 ${
            active ? "animate-pulse-slow" : ""
          }`}
        />
        <div
          className={`absolute inset-4 rounded-full ${meta.ring} opacity-70 transition-colors duration-500 ${
            state === "thinking" ? "animate-pulse-slow" : ""
          }`}
        />
        <div
          className={`relative w-32 h-32 rounded-full shadow-2xl shadow-brand-900/40 ${meta.core} transition-all duration-500 ${
            active ? "scale-110" : "scale-100 animate-float-y"
          }`}
        />
        {active && (
          <div className="absolute -bottom-10 flex items-end gap-1.5 h-16">
            {BARS.map((bar, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full ${bar.height} bg-gradient-to-t ${
                  state === "speaking" ? "from-fuchsia-400 to-brand-500" : "from-emerald-400 to-teal-500"
                }`}
                style={{
                  animation: `pulse-slow 1s ease-in-out ${bar.delay} infinite alternate`
                }}
              />
            ))}
          </div>
        )}
      </div>
      <p className="text-sm font-medium tracking-wide text-slate-400">{meta.label}</p>
    </div>
  );
}
