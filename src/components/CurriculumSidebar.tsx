"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Mic,
  Notebook,
  ScrollText,
  Sparkles,
  Circle
} from "lucide-react";
import { PHASES } from "@/lib/curriculum";
import type { NotesByUnit } from "@/hooks/useProgress";

interface CurriculumSidebarProps {
  currentUnitId: number;
  completedUnits: number[];
  notes: NotesByUnit;
  onSelectUnit: (unitId: number) => void;
  onSaveNote: (unitId: number, text: string) => void;
  progressPercent: number;
}

const PHASE_ICONS = [BookOpen, Mic, Sparkles, GraduationCap];

const PHASE_ACCENT = [
  "text-emerald-400",
  "text-sky-400",
  "text-fuchsia-400",
  "text-amber-400"
];

export default function CurriculumSidebar({
  currentUnitId,
  completedUnits,
  notes,
  onSelectUnit,
  onSaveNote,
  progressPercent
}: CurriculumSidebarProps) {
  const [openPhases, setOpenPhases] = useState<number[]>([1]);
  const [noteEditing, setNoteEditing] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const togglePhase = (phaseId: number) => {
    setOpenPhases((prev) =>
      prev.includes(phaseId) ? prev.filter((id) => id !== phaseId) : [...prev, phaseId]
    );
  };

  const openNote = (unitId: number) => {
    setNoteEditing(unitId);
    setNoteDraft(notes[unitId] ?? "");
  };

  return (
    <aside className="flex h-full w-full flex-col bg-slate-950 border-r border-slate-800">
      <div className="px-5 py-5 border-b border-slate-800">
        <h1 className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-fuchsia-600">
            <GraduationCap size={18} />
          </span>
          FluentAI
        </h1>
        <p className="mt-1 text-xs text-slate-400">AI Voice English Tutor · বাংলা + English</p>

        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{completedUnits.length} of 20 units done</span>
            <span className="tabular-nums">{progressPercent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-brand-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {PHASES.map((phase) => {
          const Icon = PHASE_ICONS[phase.id - 1];
          const isOpen = openPhases.includes(phase.id);
          const phaseDone = phase.units.every((u) => completedUnits.includes(u.id));

          return (
            <div key={phase.id} className="rounded-xl bg-slate-900/60">
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
              >
                <Icon size={16} className={PHASE_ACCENT[phase.id - 1]} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    Phase {phase.id}: {phase.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{phase.goal}</p>
                </div>
                {phaseDone && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                <ChevronDown
                  size={14}
                  className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <ul className="pb-2 px-2 space-y-1">
                  {phase.units.map((unit) => {
                    const unitDone = completedUnits.includes(unit.id);
                    const isCurrent = unit.id === currentUnitId;
                    const hasNote = !!notes[unit.id];
                    const isIelts = phase.id === 4;

                    return (
                      <li key={unit.id} className="rounded-lg bg-slate-950/60">
                        <div
                          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
                            isCurrent ? "bg-brand-600/25 ring-1 ring-brand-500/40" : "hover:bg-slate-900"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectUnit(unit.id)}
                            className="flex flex-1 items-center gap-2.5 min-w-0 text-left"
                          >
                            {unitDone ? (
                              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                            ) : isCurrent ? (
                              <Mic size={14} className="text-brand-300 shrink-0 animate-pulse" />
                            ) : (
                              <Circle size={14} className="text-slate-600 shrink-0" />
                            )}
                            <span className="min-w-0">
                              <span
                                className={`block text-[13px] leading-tight truncate ${
                                  isCurrent ? "text-white font-medium" : "text-slate-300"
                                }`}
                              >
                                Unit {unit.id}: {unit.title}
                              </span>
                            </span>
                            {isIelts && (
                              <ScrollText size={12} className="ml-auto shrink-0 text-amber-400/80" />
                            )}
                          </button>
                          <button
                            type="button"
                            aria-label={`Note for unit ${unit.id}`}
                            onClick={() => openNote(unit.id)}
                            className={`shrink-0 ${hasNote ? "text-amber-300" : "text-slate-600 hover:text-slate-400"}`}
                          >
                            <Notebook size={13} />
                          </button>
                        </div>

                        {noteEditing === unit.id && (
                          <div className="px-2.5 pb-2.5">
                            <textarea
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="My notes for this unit…"
                              rows={3}
                              className="w-full rounded-md bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                            />
                            <div className="mt-1 flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setNoteEditing(null)}
                                className="text-[11px] text-slate-500 hover:text-slate-300"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onSaveNote(unit.id, noteDraft.trim());
                                  setNoteEditing(null);
                                }}
                                className="rounded-md bg-brand-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-brand-500"
                              >
                                Save note
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-5 py-3 text-[11px] text-slate-500">
        Progress &amp; notes are saved in your browser automatically.
      </div>
    </aside>
  );
}
