"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateMetrics,
  type RundownItem,
  type TimekeeperState,
  validateRundown,
} from "@/lib/timekeeper";

export const STORAGE_KEY = "louie-timekeeper-v1";
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const pad = (value: number) => String(value).padStart(2, "0");

export const defaultState = (): TimekeeperState => {
  const today = new Date();
  return {
    name: "Untitled event",
    date: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    plannedStart: "18:00",
    plannedEnd: "20:00",
    items: [
      { id: makeId(), title: "Opening", notes: "Welcome and housekeeping.", plannedStart: "18:00", plannedEnd: "18:10", status: "pending" },
      { id: makeId(), title: "Main program", notes: "", plannedStart: "18:15", plannedEnd: "19:30", status: "pending" },
    ],
    status: "not-started",
    currentItemId: null,
    totalPausedMs: 0,
  };
};

export const clockTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
export const timeOnly = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export function useTimekeeper() {
  const [state, setState] = useState<TimekeeperState>(defaultState);
  const [now, setNow] = useState(new Date(0));
  const [editing, setEditing] = useState<string | null>(null);
  const [importError, setImportError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setState(JSON.parse(saved) as TimekeeperState); } catch { window.localStorage.removeItem(STORAGE_KEY); }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", tick); };
  }, []);

  const metrics = useMemo(() => calculateMetrics(state, now), [state, now]);
  const warnings = useMemo(() => validateRundown(state), [state]);
  const currentIndex = state.items.findIndex((item) => item.id === state.currentItemId);
  const current = currentIndex >= 0 ? state.items[currentIndex] : undefined;
  const next = state.items.slice(currentIndex + 1).find((item) => item.status === "pending") ?? state.items.find((item) => item.status === "pending");
  const set = (patch: Partial<TimekeeperState>) => setState((previous) => ({ ...previous, ...patch }));

  const startItem = (id?: string) => {
    if (!id) return;
    const timestamp = new Date().toISOString();
    setState((previous) => ({
      ...previous, status: previous.status === "not-started" ? "running" : previous.status,
      startedAt: previous.startedAt ?? timestamp, currentItemId: id,
      items: previous.items.map((item) => item.id === id && item.status === "pending" ? { ...item, status: "running", actualStart: timestamp } : item),
    }));
  };
  const startEvent = () => {
    const timestamp = new Date().toISOString();
    set({ status: "running", startedAt: state.startedAt ?? timestamp });
    if (!state.currentItemId) startItem(state.items.find((item) => item.status === "pending")?.id);
  };
  const finishItem = (skip = false) => {
    if (!current) return;
    const timestamp = new Date().toISOString();
    setState((previous) => {
      const items = previous.items.map((item) => item.id === current.id ? { ...item, status: skip ? ("skipped" as const) : ("completed" as const), actualEnd: timestamp } : item);
      const hasPending = items.some((item) => item.status === "pending" || item.status === "running");
      return { ...previous, items, currentItemId: hasPending ? previous.currentItemId : null, status: hasPending ? previous.status : "finished", finishedAt: hasPending ? previous.finishedAt : timestamp };
    });
  };
  const moveTo = (direction: 1 | -1) => {
    const index = currentIndex < 0 ? (direction > 0 ? -1 : state.items.length) : currentIndex;
    startItem(state.items[index + direction]?.id);
  };
  const togglePause = () => {
    if (state.status === "paused") set({ status: "running", totalPausedMs: state.totalPausedMs + (state.pausedAt ? Date.now() - new Date(state.pausedAt).getTime() : 0), pausedAt: undefined });
    else if (state.status === "running") set({ status: "paused", pausedAt: new Date().toISOString() });
  };
  const reset = () => {
    if (!window.confirm("Reset the event and remove all actual timings?")) return;
    setState({ ...defaultState(), name: state.name, date: state.date });
    setEditing(null);
  };
  const resetElapsedTime = () => {
    if (!window.confirm("Reset elapsed time? This keeps the event setup but clears every actual start, finish, pause, and skip.")) return;
    setState((previous) => ({
      ...previous,
      status: "not-started",
      currentItemId: null,
      startedAt: undefined,
      finishedAt: undefined,
      pausedAt: undefined,
      totalPausedMs: 0,
      items: previous.items.map((item) => ({ ...item, status: "pending" as const, actualStart: undefined, actualEnd: undefined })),
    }));
  };
  const restartEvent = () => {
    if (!window.confirm("Restart the event from the beginning? This clears all recorded actual timings and starts elapsed time over now.")) return;
    const timestamp = new Date().toISOString();
    setState((previous) => {
      const firstItem = previous.items[0];
      return {
        ...previous,
        status: firstItem ? "running" : "not-started",
        currentItemId: firstItem?.id ?? null,
        startedAt: firstItem ? timestamp : undefined,
        finishedAt: undefined,
        pausedAt: undefined,
        totalPausedMs: 0,
        items: previous.items.map((item, index) => ({
          ...item,
          status: index === 0 ? "running" as const : "pending" as const,
          actualStart: index === 0 ? timestamp : undefined,
          actualEnd: undefined,
        })),
      };
    });
  };
  const seekToItem = (id: string) => {
    const item = state.items.find((entry) => entry.id === id);
    if (!item) return;
    const timestamp = new Date().toISOString();
    setState((previous) => ({
      ...previous,
      status: "running",
      startedAt: previous.startedAt ?? timestamp,
      pausedAt: undefined,
      currentItemId: id,
      items: previous.items.map((entry) => {
        if (entry.id === id) return { ...entry, status: "running" as const, actualStart: timestamp, actualEnd: undefined };
        if (entry.status === "running") return { ...entry, status: "pending" as const, actualStart: undefined, actualEnd: undefined };
        return entry;
      }),
    }));
  };
  const updateItem = (id: string, patch: Partial<RundownItem>) => setState((previous) => ({ ...previous, items: previous.items.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  const moveItem = (id: string, direction: -1 | 1) => setState((previous) => {
    const index = previous.items.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= previous.items.length) return previous;
    const items = [...previous.items]; [items[index], items[target]] = [items[target], items[index]];
    return { ...previous, items };
  });
  const addItem = () => {
    const item: RundownItem = { id: makeId(), title: "New item", notes: "", plannedStart: "20:00", plannedEnd: "20:15", status: "pending" };
    setState((previous) => ({ ...previous, items: [...previous.items, item] }));
    setEditing(item.id);
  };
  const deleteItem = (id: string) => setState((previous) => ({ ...previous, items: previous.items.filter((item) => item.id !== id) }));
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${state.name.replace(/\s+/g, "-").toLowerCase() || "rundown"}.json`; anchor.click(); URL.revokeObjectURL(url);
  };
  const importJson = (file?: File) => {
    if (!file) return;
    file.text().then((text) => {
      try { const parsed = JSON.parse(text) as TimekeeperState; if (!parsed.items || !parsed.date) throw new Error("Invalid rundown"); setState(parsed); setImportError(""); }
      catch { setImportError("That file is not a valid timekeeper rundown."); }
    });
  };

  const transitionAlert = Boolean(current && state.status === "running" && metrics.currentRemainingMs >= 0 && metrics.currentRemainingMs <= 10_000);
  return { state, setState, now, hydrated, editing, setEditing, importError, metrics, warnings, currentIndex, current, next, transitionAlert, startEvent, startItem, finishItem, moveTo, togglePause, reset, resetElapsedTime, restartEvent, seekToItem, updateItem, moveItem, addItem, deleteItem, exportJson, importJson };
}
