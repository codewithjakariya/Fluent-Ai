"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Languages, Volume2, User } from "lucide-react";
import { GraduationCap } from "lucide-react";

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
    <div className={`flex items-end gap-2.5 animate-fade-up ${isUser ? "flex-row-reverse" : ""}`}>
      <span
        className={`flex w-7 h-7 shrink-0 rounded-full items-center justify-center ${
          isUser ? "bg-ink-800 text-ink-300" : "bg-brand-600/90 text-white"
        }`}
      >
        {isUser ? <User size={13} /> : <GraduationCap size={13} />}
      </span>
      <div className={`flex max-w-[80%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-card ${
            isUser
              ? "bg-brand-600/25 border border-brand-500/20 text-brand-50 rounded-br-md"
              : "bg-ink-900 border border-white/5 text-ink-100 rounded-bl-md"
          }`}
        >
          {message.text}
          {message.bengali && (
            <div
              className="mt-2 border-t border-white/10 pt-2 text-sm text-gold-300"
              dir="auto"
            >
              {message.bengali}
            </div>
          )}
        </div>
        {!isUser && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onSpeak(message.text)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-500 hover:bg-ink-900 hover:text-ink-200 transition-colors"
            >
              <Volume2 size={12} /> Repeat
            </button>
            <button
              type="button"
              onClick={() => !message.bengali && !translating && onTranslate(message.id)}
              disabled={translating || !!message.bengali}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-ink-500 hover:bg-ink-900 hover:text-ink-200 transition-colors disabled:opacity-50"
            >
              {translating ? (
                <Loader2 size={12} className="animate-spin" />
              ) : message.bengali ? (
                <Check size={12} className="text-success-400" />
              ) : (
                <Languages size={12} />
              )}
              {message.bengali ? "Bengali shown" : "Translate to Bengali"}
            </button>
          </div>
        )}
      </div>
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
    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">
      {messages.length === 0 && !interim && (
        <p className="pt-10 text-center text-sm text-ink-600">Transcript will appear here.</p>
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
        <div className="flex flex-row-reverse items-end gap-2.5">
          <span className="flex w-7 h-7 shrink-0 rounded-full items-center justify-center bg-ink-800 text-ink-300">
            <User size={13} />
          </span>
          <div className="max-w-[80%] rounded-2xl rounded-br-md border border-brand-500/15 bg-brand-600/10 px-4 py-2.5 text-sm italic text-brand-200/70">
            {interim}…
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
