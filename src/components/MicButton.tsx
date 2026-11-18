"use client";

import { Headphones, Mic, MicOff } from "lucide-react";
import type { ListenMode, TutorState } from "@/hooks/useSpeech";

interface MicButtonProps {
  state: TutorState;
  mode: ListenMode;
  supported: boolean;
  listening: boolean;
  onPushStart: () => void;
  onPushEnd: () => void;
}

export default function MicButton({
  state,
  mode,
  supported,
  listening,
  onPushStart,
  onPushEnd
}: MicButtonProps) {
  const speaking = state === "speaking";
  const disabled = !supported || speaking;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        aria-label={listening ? "Stop listening" : "Start listening"}
        disabled={disabled}
        onMouseDown={() => !disabled && onPushStart()}
        onMouseUp={() => !disabled && onPushEnd()}
        onMouseLeave={() => !disabled && listening && onPushEnd()}
        onTouchStart={(e) => {
          e.preventDefault();
          if (!disabled) onPushStart();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          if (!disabled && listening) onPushEnd();
        }}
        className={`relative flex items-center justify-center w-20 h-20 rounded-full text-white transition-all
          ${disabled
            ? "bg-slate-700 cursor-not-allowed"
            : listening
            ? "bg-emerald-500 hover:bg-emerald-400 scale-105 shadow-lg shadow-emerald-500/40"
            : "bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/40"}`}
      >
        {listening ? <Mic size={30} /> : <MicOff size={30} className="opacity-60" />}
        {!supported && (
          <span className="absolute inset-0 rounded-full ring-2 ring-red-400/60" />
        )}
      </button>
      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Headphones size={12} />
        {mode === "push"
          ? supported
            ? "Hold to talk"
            : "Speech recognition not supported in this browser — try Chrome"
          : supported
          ? "Auto-listen: just speak"
          : null}
      </p>
    </div>
  );
}
