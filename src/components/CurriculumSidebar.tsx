"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Mic,
  Notebook,
  Play,
  ScrollText,
  Sparkles,
  Circle
} from "lucide-react";
import { PHASES, lessonKey, type Lesson } from "@/lib/curriculum";
import type { CompletedLessonMap, NotesByUnit } from "@/hooks/useProgress";

interface CurriculumSidebarProps {
  currentUnitId: number;
  currentLessonId: number;
  completedUnits: number[];
  completedLessons: CompletedLessonMap;
  notes: NotesByUnit;
  onSelectLesson: (unitId: number, lessonId: number) => void;
  onSaveNote: (unitId: number, text: string) => void;
  progressPercent: number;
  lessonPercent: number;
}

const PHASE_ICONS = [BookOpen, Mic, Sparkles, GraduationCap];

const PHASE_ACCENT = ["text-emerald-400", "text-sky-400", "text-fuchsia-400", "text-gold-400"];

export default function CurriculumSidebar({
  currentUnitId,
  currentLessonId,
  completedUnits,
  completedLessons,
  notes,
  onSelectLesson,
  onSaveNote,
  progressPercent,
  lessonPercent
}: CurriculumSidebarProps) {
  const [openPhases, setOpenPhases] = useState<number[]>([1]);
  const [openUnits, setOpenUnits] = useState<number[]>([1]);
  const [noteEditing, setNoteEditing] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const togglePhase = (phaseId: number) => {
    setOpenPhases((prev) =>
      prev.includes(phaseId) ? prev.filter((id) => id !== phaseId) : [...prev, phaseId]
    );
  };

  const toggleUnit = (unitId: number) => {
    setOpenUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const openNote = (unitId: number) => {
    setNoteEditing(unitId);
    setNoteDraft(notes[unitId] ?? "");
  };

  return (
    <aside className="flex h-full w-full flex-col bg-ink-950 border-r border-white/5">
      <div className="px-5 py-5 border-b border-white/5">
        <h1 className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700">
            <GraduationCap size={18} />
          </span>
          FluentAI
        </h1>
        <p className="mt-1 text-xs text-ink-400">AI Voice English Tutor · বাংলা + English</p>

        <div className="mt-4 space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-[11px] text-ink-400 mb-1">
              <span>Units · {completedUnits.length}/20</span>
              <span className="tabular-nums">{progressPercent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-success-400 to-brand-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] text-ink-400 mb-1">
              <span>Lessons · {lessonPercent}/60</span>
              <span className="tabular-nums">{Math.round((lessonPercent / 60) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-400 to-brand-500 transition-all duration-500"
                style={{ width: `${(lessonPercent / 60) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {PHASES.map((phase) => {
          const Icon = PHASE_ICONS[phase.id - 1];
          const isOpen = openPhases.includes(phase.id);
          const phaseDone = phase.units.every((u) => completedUnits.includes(u.id));

          return (
            <div key={phase.id} className="rounded-xl bg-ink-900/60">
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
              >
                <Icon size={16} className={PHASE_ACCENT[phase.id - 1]} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-100 truncate">
                    Phase {phase.id}: {phase.title}
                  </p>
                  <p className="text-[11px] text-ink-500 truncate">{phase.goal}</p>
                </div>
                {phaseDone && <CheckCircle2 size={15} className="text-success-400 shrink-0" />}
                <ChevronDown
                  size={14}
                  className={`text-ink-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <ul className="space-y-1.5 pb-2 px-2">
                  {phase.units.map((unit) => {
                    const unitDone = completedUnits.includes(unit.id);
                    const isCurrent = unit.id === currentUnitId;
                    const areLessonsOpen = openUnits.includes(unit.id);
                    const hasNote = !!notes[unit.id];
                    const isIelts = phase.id === 4;
                    const doneLessons = unit.lessons.filter(
                      (l) => completedLessons[lessonKey(unit.id, l.id)]
                    ).length;

                    return (
                      <li key={unit.id} className="rounded-lg bg-ink-950/60 border border-white/5">
                        <div
                          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
                            isCurrent ? "bg-brand-600/25 ring-1 ring-brand-500/40" : "hover:bg-ink-900"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectLesson(unit.id, 1)}
                            className="flex flex-1 items-center gap-2.5 min-w-0 text-left"
                          >
                            {unitDone ? (
                              <CheckCircle2 size={14} className="text-success-400 shrink-0" />
                            ) : isCurrent ? (
                              <Mic size={14} className="text-brand-300 shrink-0 animate-pulse" />
                            ) : (
                              <Circle size={14} className="text-ink-600 shrink-0" />
                            )}
                            <span className="min-w-0">
                              <span
                                className={`block text-[13px] leading-tight truncate font-medium ${
                                  isCurrent ? "text-white" : "text-ink-300"
                                }`}
                              >
                                Unit {unit.id}: {unit.title}
                              </span>
                              <span className="block text-[10px] text-ink-500">
                                {doneLessons}/{unit.lessons.length} lessons
                              </span>
                            </span>
                            {isIelts && <ScrollText size={12} className="ml-auto shrink-0 text-gold-400/80" />}
                          </button>
                          <button
                            type="button"
                            aria-label={`Lessons for unit ${unit.id}`}
                            onClick={() => toggleUnit(unit.id)}
                            className="shrink-0 text-ink-500 hover:text-ink-200"
                          >
                            {areLessonsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <button
                            type="button"
                            aria-label={`Note for unit ${unit.id}`}
                            onClick={() => openNote(unit.id)}
                            className={`shrink-0 ${hasNote ? "text-gold-300" : "text-ink-600 hover:text-ink-400"}`}
                          >
                            <Notebook size={13} />
                          </button>
                        </div>

                        {areLessonsOpen && (
                          <ul className="px-2.5 pb-2 pt-1 mt-1 space-y-0.5 border-t border-white/5">
                            {unit.lessons.map((lesson: Lesson) => {
                              const lessonDone = !!completedLessons[lessonKey(unit.id, lesson.id)];
                              const isCurrentLesson = isCurrent && currentLessonId === lesson.id;
                              return (
                                <li key={lesson.id}>
                                  <button
                                    type="button"
                                    onClick={() => onSelectLesson(unit.id, lesson.id)}
                                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                                      isCurrentLesson
                                        ? "bg-brand-600/20 text-brand-100"
                                        : "text-ink-400 hover:bg-ink-900 hover:text-ink-200"
                                    }`}
                                  >
                                    {lessonDone ? (
                                      <CheckCircle2 size={12} className="text-success-400 shrink-0" />
                                    ) : (
                                      <Play size={11} className="shrink-0 text-ink-600" />
                                    )}
                                    <span className="min-w-0 truncate text-[12px]">
                                      {unit.id}.{lesson.id} {lesson.title}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        {noteEditing === unit.id && (
                          <div className="px-2.5 pb-2.5">
                            <textarea
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="My notes for this unit…"
                              rows={3}
                              className="w-full rounded-md bg-ink-900 border border-ink-700 px-2 py-1.5 text-xs text-ink-200 placeholder:text-ink-600 focus:outline-none focus:border-brand-500"
                            />
                            <div className="mt-1 flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setNoteEditing(null)}
                                className="text-[11px] text-ink-500 hover:text-ink-300"
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

      <div className="border-t border-white/5 px-5 py-3 text-[11px] text-ink-500">
        Progress &amp; notes are saved in your browser automatically.
      </div>
    </aside>
  );
}
