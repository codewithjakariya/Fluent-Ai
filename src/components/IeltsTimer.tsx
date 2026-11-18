"use client";

import { useEffect, useState } from "react";
import { Pause, Play, Timer, RotateCcw } from "lucide-react";

interface IeltsTimerProps {
  visible: boolean;
  phaseLabel: string;
  prepSeconds?: number;
  speakSeconds?: number;
}

export default function IeltsTimer({
  visible,
  phaseLabel,
  prepSeconds = 60,
  speakSeconds = 120
}: IeltsTimerProps) {
  const [stage, setStage] = useState<"prep" | "speak" | "done">("prep");
  const [remaining, setRemaining] = useState(prepSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 0) return r - 1;
        return r;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (running && remaining === 0) {
      if (stage === "prep") {
        setStage("speak");
        setRemaining(speakSeconds);
      } else {
        setStage("done");
        setRunning(false);
      }
    }
  }, [running, remaining, stage, speakSeconds]);

  if (!visible) return null;

  const total = stage === "prep" ? prepSeconds : speakSeconds;
  const pct = total > 0 ? ((total - remaining) / total) * 100 : 100;
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");

  const reset = () => {
    setStage("prep");
    setRemaining(prepSeconds);
    setRunning(false);
  };

  const stageColor =
    stage === "prep" ? "stroke-amber-400" : stage === "speak" ? "stroke-emerald-400" : "stroke-slate-500";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Timer size={16} className="text-brand-400" />
          IELTS Part 2: Cue Card
        </div>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              strokeWidth="3"
              className={stageColor}
              strokeDasharray={`${pct} 100`}
              strokeLinecap="round"
              pathLength={100}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white tabular-nums">
            {stage === "done" ? "0:00" : `${mm}:${ss}`}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-300">
            {stage === "prep" && "1 minute preparation — think and take notes out loud if you like."}
            {stage === "speak" && "Speak now — keep going for the full 2 minutes."}
            {stage === "done" && "Time finished. Alex will now discuss what you said."}
          </p>
          <p className="mt-1 text-xs text-slate-500">{phaseLabel}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              disabled={stage === "done"}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-medium text-white"
            >
              {running ? <Pause size={12} /> : <Play size={12} />}
              {running ? "Pause" : stage === "done" ? "Finished" : stage === "prep" && remaining === prepSeconds ? "Start prep" : "Resume"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
