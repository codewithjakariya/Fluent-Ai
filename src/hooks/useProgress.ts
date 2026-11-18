"use client";

import { useCallback, useEffect, useState } from "react";
import { ALL_UNITS, type Unit } from "@/lib/curriculum";

const STORAGE_KEYS = {
  currentUnit: "fluentai.currentUnit",
  completedUnits: "fluentai.completedUnits",
  notes: "fluentai.notes",
  learnerName: "fluentai.learnerName"
};

export type NotesByUnit = Record<number, string>;

export function useProgress() {
  const [currentUnitId, setCurrentUnitId] = useState<number>(ALL_UNITS[0].id);
  const [completedUnits, setCompletedUnits] = useState<number[]>([]);
  const [notes, setNotes] = useState<NotesByUnit>({});
  const [learnerName, setLearnerName] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedUnit = window.localStorage.getItem(STORAGE_KEYS.currentUnit);
      if (storedUnit) {
        const id = Number(storedUnit);
        if (Number.isFinite(id) && ALL_UNITS.some((u) => u.id === id)) setCurrentUnitId(id);
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

  const selectUnit = useCallback((unit: Unit) => {
    setCurrentUnitId(unit.id);
    persist(STORAGE_KEYS.currentUnit, String(unit.id));
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
    completedUnits,
    notes,
    learnerName,
    progressPercent,
    selectUnit,
    markComplete,
    markIncomplete,
    saveNote,
    saveLearnerName
  };
}
