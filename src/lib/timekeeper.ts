export type EventStatus = "not-started" | "running" | "paused" | "finished";
export type ItemStatus = "pending" | "running" | "completed" | "skipped";

export type RundownItem = {
  id: string;
  title: string;
  notes: string;
  plannedStart: string;
  plannedEnd: string;
  status: ItemStatus;
  actualStart?: string;
  actualEnd?: string;
};

export type TimekeeperState = {
  name: string;
  date: string;
  plannedStart: string;
  plannedEnd: string;
  items: RundownItem[];
  status: EventStatus;
  currentItemId: string | null;
  startedAt?: string;
  finishedAt?: string;
  pausedAt?: string;
  totalPausedMs: number;
};

export type ScheduleMetrics = {
  plannedDurationMs: number;
  activeElapsedMs: number;
  eventRemainingMs: number;
  currentElapsedMs: number;
  currentRemainingMs: number;
  itemOvertimeMs: number;
  scheduleVarianceMs: number;
  projectedFinish: Date | null;
  projectedOvertimeMs: number;
};

const localDateTime = (date: string, time: string) => new Date(`${date}T${time}`);

export function plannedDuration(item: Pick<RundownItem, "plannedStart" | "plannedEnd">) {
  const duration = localDateTime("2000-01-01", item.plannedEnd).getTime() -
    localDateTime("2000-01-01", item.plannedStart).getTime();
  return duration >= 0 ? duration : duration + 24 * 60 * 60 * 1000;
}

export function eventDuration(state: Pick<TimekeeperState, "date" | "plannedStart" | "plannedEnd">) {
  const start = localDateTime(state.date, state.plannedStart).getTime();
  let end = localDateTime(state.date, state.plannedEnd).getTime();
  if (end < start) end += 24 * 60 * 60 * 1000;
  return end - start;
}

export function eventBoundary(state: Pick<TimekeeperState, "date" | "plannedStart" | "plannedEnd">, end = false) {
  const start = localDateTime(state.date, state.plannedStart);
  const finish = localDateTime(state.date, state.plannedEnd);
  if (end && finish < start) finish.setDate(finish.getDate() + 1);
  return end ? finish : start;
}

export function activeElapsedMs(state: Pick<TimekeeperState, "status" | "startedAt" | "pausedAt" | "totalPausedMs">, now = new Date()) {
  if (!state.startedAt) return 0;
  const end = state.status === "finished" && state.pausedAt ? new Date(state.pausedAt) : now;
  const pausedNow = state.status === "paused" && state.pausedAt
    ? now.getTime() - new Date(state.pausedAt).getTime()
    : 0;
  return Math.max(0, end.getTime() - new Date(state.startedAt).getTime() - state.totalPausedMs - pausedNow);
}

export function itemElapsedMs(item: RundownItem, now = new Date()) {
  if (!item.actualStart) return 0;
  const end = item.actualEnd ? new Date(item.actualEnd) : now;
  return Math.max(0, end.getTime() - new Date(item.actualStart).getTime());
}

export function calculateMetrics(state: TimekeeperState, now = new Date()): ScheduleMetrics {
  const plannedEnd = eventBoundary(state, true);
  const activeElapsed = activeElapsedMs(state, now);
  const current = state.items.find((item) => item.id === state.currentItemId);
  const currentElapsed = current ? itemElapsedMs(current, now) : 0;
  const currentPlan = current ? plannedDuration(current) : 0;
  const currentRemaining = currentPlan - currentElapsed;
  const itemOvertime = Math.max(0, -currentRemaining);
  const eventRemaining = Math.max(0, eventDuration(state) - activeElapsed);
  const completedPlanned = state.items
    .filter((item) => item.status === "completed" || item.status === "skipped")
    .reduce((total, item) => total + plannedDuration(item), 0);
  const actualStart = state.startedAt ? new Date(state.startedAt).getTime() : eventBoundary(state).getTime();
  const scheduleVariance = state.status === "not-started"
    ? 0
    : actualStart + activeElapsed - eventBoundary(state).getTime() - completedPlanned;
  const remainingDuration = state.items
    .filter((item) => item.status === "pending")
    .reduce((total, item) => total + plannedDuration(item), 0);
  const projectedFinish = state.status === "not-started"
    ? eventBoundary(state, true)
    : state.status === "finished"
      ? (state.finishedAt ? new Date(state.finishedAt) : now)
      : new Date(now.getTime() + remainingDuration + (current ? Math.max(0, currentRemaining) : 0));

  return {
    plannedDurationMs: eventDuration(state),
    activeElapsedMs: activeElapsed,
    eventRemainingMs: eventRemaining,
    currentElapsedMs: currentElapsed,
    currentRemainingMs: currentRemaining,
    itemOvertimeMs: itemOvertime,
    scheduleVarianceMs: scheduleVariance,
    projectedFinish,
    projectedOvertimeMs: projectedFinish ? Math.max(0, projectedFinish.getTime() - plannedEnd.getTime()) : 0,
  };
}

export function formatDuration(ms: number) {
  const sign = ms < 0 ? "-" : "";
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${sign}${hours ? `${hours}:` : ""}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function validateRundown(state: Pick<TimekeeperState, "date" | "plannedStart" | "plannedEnd" | "items">) {
  const warnings: string[] = [];
  const eventStart = eventBoundary(state).getTime();
  const eventEnd = eventBoundary(state, true).getTime();
  const ranges = state.items.map((item) => {
    let start = localDateTime(state.date, item.plannedStart).getTime();
    let end = localDateTime(state.date, item.plannedEnd).getTime();
    if (end < start) end += 24 * 60 * 60 * 1000;
    return { item, start, end };
  });
  ranges.forEach(({ item, start, end }) => {
    if (end <= start) warnings.push(`${item.title}: end time must be after start time.`);
    if (start < eventStart || end > eventEnd) warnings.push(`${item.title}: outside the event boundaries.`);
  });
  ranges.slice(1).forEach((range, index) => {
    if (range.start < ranges[index].end) {
      warnings.push(`${range.item.title}: overlaps ${ranges[index].item.title}.`);
    }
  });
  return warnings;
}
