"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Languages, Volume2 } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  bengali?: string;
  translating?: boolean;
}

interface TranscriptPanelProps {
  messages: ChatMessage[];
  open: boolean;
  interim: string;
  onSpeak: (text: string) => void;
  onTranslate: (messageId: string) => void;
  translatingIds: Set<string>;
}

function MessageBubble({
  message,
  onSpeak,
  onTranslate,
  translating
}: {
  message: ChatMessage;
  onSpeak: (text: string) => void;
  onTranslate: (messageId: string) => void;
  translating: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-brand-600/20 text-brand-100 rounded-br-sm"
            : "bg-slate-800 text-slate-100 rounded-bl-sm"
        }`}
      >
        {message.text}
        {message.bengali && (
          <div className="mt-2 pt-2 border-t border-white/10 text-amber-200 text-sm" dir="auto">
            {message.bengali}
          </div>
        )}
      </div>
      {!isUser && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onSpeak(message.text)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Volume2 size={12} /> Repeat
          </button>
          <button
            type="button"
            onClick={() => !message.bengali && !translating && onTranslate(message.id)}
            disabled={translating || !!message.bengali}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {translating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : message.bengali ? (
              <Check size={12} />
            ) : (
              <Languages size={12} />
            )}
            {message.bengali ? "Bengali shown" : "Translate to Bengali"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function TranscriptPanel({
  messages,
  open,
  interim,
  onSpeak,
  onTranslate,
  translatingIds
}: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [open, messages, interim]);

  if (!open) return null;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4 bg-slate-900/60">
      {messages.length === 0 && !interim && (
        <p className="text-center text-sm text-slate-500 pt-8">
          Transcript will appear here. Hold the mic and start speaking.
        </p>
      )}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onSpeak={onSpeak}
          onTranslate={onTranslate}
          translating={translatingIds.has(message.id)}
        />
      ))}
      {interim && (
        <div className="flex flex-col items-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600/10 border border-brand-500/20 px-4 py-2.5 text-sm text-brand-200/70 italic">
            {interim}…
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
