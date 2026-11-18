"use client";

import type { TutorState } from "@/hooks/useSpeech";

const STATE_META: Record<TutorState, { label: string; halo: string; core: string; dot: string }> = {
  ready: {
    label: "Ready when you are",
    halo: "bg-brand-500/10",
    core: "bg-gradient-to-br from-brand-500/80 to-brand-800",
    dot: "bg-ink-500"
  },
  listening: {
    label: "Listening…",
    halo: "bg-success-500/15",
    core: "bg-gradient-to-br from-emerald-400 to-teal-700",
    dot: "bg-success-400"
  },
  thinking: {
    label: "Alex is thinking…",
    halo: "bg-gold-500/10",
    core: "bg-gradient-to-br from-amber-300 to-orange-600",
    dot: "bg-gold-400"
  },
  speaking: {
    label: "Alex is speaking…",
    halo: "bg-brand-500/20",
    core: "bg-gradient-to-br from-brand-300 to-brand-700",
    dot: "bg-brand-400"
  }
};

export default function VoiceOrb({ state }: { state: TutorState }) {
  const meta = STATE_META[state] ?? STATE_META.ready;
  const active = state === "listening" || state === "speaking";

  return (
    <div className="flex flex-col items-center gap-7 select-none">
      <div className="relative flex items-center justify-center w-60 h-60">
        <div
          className={`absolute inset-0 rounded-full ${meta.halo} blur-2xl transition-colors duration-700 ${
            active ? "animate-pulse-slow" : ""
          }`}
        />
        <div className="absolute inset-0 rounded-full border border-white/5" />
        <div
          className={`absolute inset-6 rounded-full border border-white/5 ${
            state === "thinking" ? "animate-pulse-slow" : ""
          }`}
        />
        <div
          className={`relative w-36 h-36 rounded-full shadow-glow ${meta.core} transition-all duration-500 ring-1 ring-white/20 ${
            active ? "scale-110" : "scale-100 animate-float-y"
          }`}
        >
          <div className="absolute inset-3 rounded-full ring-1 ring-white/10" />
          <div className="absolute top-6 left-8 w-8 h-8 rounded-full bg-white/15 blur-md" />
        </div>
        {active && (
          <div className="absolute -bottom-11 flex items-end gap-1.5 h-14">
            {[3, 6, 10, 14, 10, 6, 3].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full transition-colors duration-300"
                style={{
                  height: `${h * 3}px`,
                  backgroundColor: state === "listening" ? "#34d399" : "#837ffe",
                  animation: `pulse-slow ${0.9 + i * 0.08}s ease-in-out ${(i * 90) % 400}ms infinite alternate`
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/5 bg-ink-900/80 px-3.5 py-1.5 shadow-card">
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${active ? "animate-pulse" : ""}`} />
        <span className="text-xs font-medium tracking-wide text-ink-300">{meta.label}</span>
      </div>
    </div>
  );
}
