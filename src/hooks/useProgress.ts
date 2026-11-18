"use client";

import { useCallback, useEffect, useState } from "react";
import { ALL_UNITS, type Unit } from "@/lib/curriculum";

const STORAGE_KEYS = {
  currentUnit: "fluentai.currentUnit",
  currentLesson: "fluentai.currentLesson",
  completedUnits: "fluentai.completedUnits",
  completedLessons: "fluentai.completedLessons",
  notes: "fluentai.notes",
  learnerName: "fluentai.learnerName",
  speechRate: "fluentai.speechRate"
};

export type NotesByUnit = Record<number, string>;
export type CompletedLessonMap = Record<string, boolean>;

export function useProgress() {
  const [currentUnitId, setCurrentUnitId] = useState<number>(ALL_UNITS[0].id);
  const [currentLessonId, setCurrentLessonId] = useState<number>(1);
  const [completedUnits, setCompletedUnits] = useState<number[]>([]);
  const [completedLessons, setCompletedLessons] = useState<CompletedLessonMap>({});
  const [notes, setNotes] = useState<NotesByUnit>({});
  const [learnerName, setLearnerName] = useState<string>("");
  const [speechRate, setSpeechRateState] = useState<number>(0.85);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedUnit = window.localStorage.getItem(STORAGE_KEYS.currentUnit);
      if (storedUnit) {
        const id = Number(storedUnit);
        if (Number.isFinite(id) && ALL_UNITS.some((u) => u.id === id)) setCurrentUnitId(id);
      }
      const storedLesson = window.localStorage.getItem(STORAGE_KEYS.currentLesson);
      if (storedLesson && Number.isFinite(Number(storedLesson))) {
        setCurrentLessonId(Number(storedLesson));
      }
      const storedLessons = window.localStorage.getItem(STORAGE_KEYS.completedLessons);
      if (storedLessons) {
        const parsed = JSON.parse(storedLessons);
        if (parsed && typeof parsed === "object") setCompletedLessons(parsed as CompletedLessonMap);
      }
      const storedRate = window.localStorage.getItem(STORAGE_KEYS.speechRate);
      if (storedRate) {
        const rate = Number(storedRate);
        if (Number.isFinite(rate) && rate >= 0.5 && rate <= 1.5) setSpeechRateState(rate);
      }
      const storedCompleted = window.localStorage.getItem(STORAGE_KEYS.completedUnits);
      if (storedCompleted) {
        const parsed = JSON.parse(storedCompleted);
        if (Array.isArray(parsed)) {
          setCompletedUnits(parsed.filter((n: unknown) => Number.isFinite(n)));
        }
      }
      const storedNotes = window.localStorage.getItem(STORAGE_KEYS.notes);
      if (storedNotes) {
        const parsed = JSON.parse(storedNotes);
        if (parsed && typeof parsed === "object") setNotes(parsed as NotesByUnit);
      }
      const storedName = window.localStorage.getItem(STORAGE_KEYS.learnerName);
      if (storedName) setLearnerName(storedName);
    } catch {
      // localStorage unavailable (private mode), keep defaults
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // storage full or blocked, ignore
    }
  }, []);

  const selectUnit = useCallback((unit: Unit, lessonId = 1) => {
    setCurrentUnitId(unit.id);
    setCurrentLessonId(lessonId);
    persist(STORAGE_KEYS.currentUnit, String(unit.id));
    persist(STORAGE_KEYS.currentLesson, String(lessonId));
  }, [persist]);

  const selectLesson = useCallback((unitId: number, lessonId: number) => {
    setCurrentUnitId(unitId);
    setCurrentLessonId(lessonId);
    persist(STORAGE_KEYS.currentUnit, String(unitId));
    persist(STORAGE_KEYS.currentLesson, String(lessonId));
  }, [persist]);

  const markLessonComplete = useCallback((unitId: number, lessonId: number) => {
    setCompletedLessons((prev) => {
      if (prev[`${unitId}.${lessonId}`]) return prev;
      const next = { ...prev, [`${unitId}.${lessonId}`]: true };
      persist(STORAGE_KEYS.completedLessons, JSON.stringify(next));
      return next;
    });
  }, [persist]);

  const setSpeechRate = useCallback((rate: number) => {
    setSpeechRateState(rate);
    persist(STORAGE_KEYS.speechRate, String(rate));
  }, [persist]);

  const markComplete = useCallback((unitId: number) => {
    setCompletedUnits((prev) => {
      if (prev.includes(unitId)) return prev;
      const next = [...prev, unitId].sort((a, b) => a - b);
      persist(STORAGE_KEYS.completedUnits, JSON.stringify(next));
      return next;
    });
  }, [persist]);

  const markIncomplete = useCallback((unitId: number) => {
    setCompletedUnits((prev) => {
      const next = prev.filter((id) => id !== unitId);
      persist(STORAGE_KEYS.completedUnits, JSON.stringify(next));
      return next;
    });
  }, [persist]);

  const saveNote = useCallback((unitId: number, text: string) => {
    setNotes((prev) => {
      const next = { ...prev, [unitId]: text };
      if (!text) delete next[unitId];
      persist(STORAGE_KEYS.notes, JSON.stringify(next));
      return next;
    });
  }, [persist]);

  const saveLearnerName = useCallback((name: string) => {
    setLearnerName(name);
    persist(STORAGE_KEYS.learnerName, name);
  }, [persist]);

  const progressPercent = Math.round((completedUnits.length / ALL_UNITS.length) * 100);

  return {
    hydrated,
    currentUnitId,
    currentUnit: ALL_UNITS.find((u) => u.id === currentUnitId) ?? ALL_UNITS[0],
    currentLessonId,
    completedUnits,
    completedLessons,
    notes,
    learnerName,
    speechRate,
    progressPercent,
    selectUnit,
    selectLesson,
    markLessonComplete,
    markComplete,
    markIncomplete,
    saveNote,
    saveLearnerName,
    setSpeechRate
  };
}
