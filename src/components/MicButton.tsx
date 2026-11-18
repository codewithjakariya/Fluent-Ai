"use client";

import { Mic } from "lucide-react";
import type { TutorState } from "@/hooks/useSpeech";

interface MicButtonProps {
  state: TutorState;
  supported: boolean;
  listening: boolean;
  onPushStart: () => void;
  onPushEnd: () => void;
}

export default function MicButton({
  state,
  supported,
  listening,
  onPushStart,
  onPushEnd
}: MicButtonProps) {
  const busy = state === "speaking" || state === "thinking";
  const disabled = !supported || busy;

  const press = () => !disabled && onPushStart();
  const release = () => !disabled && listening && onPushEnd();

  return (
    <div className="flex flex-col items-center gap-2.5">
      <button
        type="button"
        aria-label={listening ? "Release to send" : "Hold to talk"}
        disabled={disabled}
        onMouseDown={press}
        onMouseUp={release}
        onMouseLeave={release}
        onTouchStart={(e) => {
          e.preventDefault();
          press();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          release();
        }}
        className={`group flex items-center gap-2.5 rounded-full pl-4 pr-6 py-3.5 font-semibold text-[15px] text-white transition-all
          ${disabled
            ? "bg-ink-800 text-ink-500 cursor-not-allowed"
            : listening
            ? "bg-success-600 hover:bg-success-500 scale-[1.02] shadow-glow-success"
            : "bg-brand-600 hover:bg-brand-500 shadow-glow active:scale-95"}`}
      >
        <span
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
            listening ? "bg-white/20" : "bg-white/10 group-active:bg-white/20"
          }`}
        >
          <Mic size={18} />
        </span>
        {listening ? "Listening… release to send" : busy ? "Alex is responding…" : "Push to Talk"}
      </button>
      <p className="text-[11px] text-ink-500">
        {supported
          ? listening
            ? "Release the button (or Space) when done"
            : busy
            ? "One moment…"
            : "Hold the button — or hold the Space key"
          : "Speech recognition needs Chrome or Edge — type below instead"}
      </p>
    </div>
  );
}
