"use client";

import Link from "next/link";
import { eventDuration, formatDuration, plannedDuration } from "@/lib/timekeeper";
import { cn } from "@/lib/utils";
import { clockTime, timeOnly, useTimekeeper } from "../useTimekeeper";

const buttonClass =
  "min-h-10 border border-[var(--line)] bg-transparent px-[14px] py-[10px] font-sans text-[.78rem] font-semibold text-ink transition-[transform,background-color,color,border-color] duration-150 hover:border-[var(--ink)] hover:bg-[var(--paper-deep)] active:translate-y-px active:scale-[.98]";
const primaryButtonClass = cn(
  buttonClass,
  "border-[var(--ink)] bg-[var(--ink)] text-paper hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-paper",
);
const eyebrowClass =
  "mb-[22px] font-mono text-[.68rem] tracking-[.12em] text-accent uppercase";
const sectionHeadingClass =
  "mb-[30px] flex items-end justify-between gap-6 max-[760px]:items-start max-[760px]:flex-col";
const metaClass =
  "font-mono text-[.66rem] tracking-[.06em] text-ink-soft uppercase";

const signedDuration = (ms: number) =>
  `${ms >= 0 ? "+" : "-"}${formatDuration(Math.abs(ms))}`;

function Metric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="flex min-h-[130px] flex-col justify-between border-r border-[var(--line)] p-5 last:border-r-0 max-[760px]:nth-[2]:border-r-0 max-[760px]:nth-[-n+2]:border-b">
      <span className={metaClass}>{label}</span>
      <strong className={`text-[clamp(1.8rem,3vw,3rem)] font-semibold tracking-[-.07em] ${warning ? "text-accent-dark" : ""}`}>
        {value}
      </strong>
    </div>
  );
}

export default function TimekeeperLivePage() {
  const {
    state,
    now,
    hydrated,
    metrics,
    currentIndex,
    current,
    next,
    transitionAlert,
    startEvent,
    startItem,
    finishItem,
    moveTo,
    togglePause,
    reset,
    resetElapsedTime,
    restartEvent,
    seekToItem,
  } = useTimekeeper();

  return (
    <main className={`min-h-dvh bg-[var(--paper)] text-ink ${transitionAlert ? "animate-[tk-screen-flash_900ms_ease-in-out_infinite]" : ""}`}>
      <header className="grid min-h-[76px] grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-6 border-b border-[var(--line)] px-[max(24px,calc((100%-1320px)/2))] py-4 max-[760px]:grid-cols-[1fr_auto]">
        <Link href="/timekeeper" className="w-fit text-[1.35rem] font-extrabold tracking-[-.08em]" aria-label="Back to timekeeper setup">
          LH<span className="text-accent">.</span>
        </Link>
        <div className="flex flex-col gap-1 font-mono text-[.68rem] tracking-[.08em] uppercase max-[760px]:hidden">
          <span>Live timekeeper</span>
          <strong className="font-sans text-base tracking-[-.03em] normal-case">{state.name}</strong>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={metaClass}>Local time</span>
          <strong className="font-mono text-base tracking-[.04em] text-accent">{hydrated ? clockTime(now) : "--:--:--"}</strong>
        </div>
      </header>

      <div className="mx-auto w-[min(1320px,calc(100%-48px))] pt-[70px] pb-11 max-[760px]:w-[min(100%-32px,1320px)] max-[760px]:pt-10">
        <section className="flex items-end justify-between gap-8 border-b border-[var(--line)] pb-11 max-[760px]:items-start max-[760px]:flex-col">
          <div>
            <p className={eyebrowClass}>Live operator view</p>
            <h1 className="mb-[18px] max-w-[700px] text-[clamp(2.8rem,6vw,6rem)] leading-[.9] max-[760px]:text-[clamp(2.8rem,15vw,5rem)]">
              {state.status === "not-started"
                ? "Ready when you are."
                : current
                  ? current.title
                  : state.status === "finished"
                    ? "Event complete."
                    : "Rundown in progress."}
            </h1>
            <p className="m-0 font-mono text-[.75rem] tracking-[.08em] text-ink-soft uppercase">
              {state.date} <span aria-hidden="true">/</span> {state.plannedStart}-{state.plannedEnd}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.status === "not-started" && <button className={primaryButtonClass} onClick={startEvent}>Start event</button>}
            {state.status === "running" && <button className={primaryButtonClass} onClick={togglePause}>Pause</button>}
            {state.status === "paused" && <button className={primaryButtonClass} onClick={togglePause}>Resume</button>}
            {current && <button className={buttonClass} onClick={() => finishItem(false)}>Finish item</button>}
            {next && <button className={buttonClass} onClick={() => startItem(next.id)}>Start next</button>}
          </div>
        </section>

        <section className="grid grid-cols-4 border-b border-[var(--line)] max-[760px]:grid-cols-2" aria-label="Event metrics">
          <Metric label="Event elapsed" value={formatDuration(metrics.activeElapsedMs)} />
          <Metric label="Event time remaining" value={formatDuration(metrics.eventRemainingMs)} warning={metrics.eventRemainingMs === 0} />
          <Metric label="Schedule variance" value={signedDuration(metrics.scheduleVarianceMs)} warning={metrics.scheduleVarianceMs > 0} />
          <Metric label="Projected finish" value={metrics.projectedFinish ? timeOnly(metrics.projectedFinish) : "-"} warning={metrics.projectedOvertimeMs > 0} />
        </section>

        {transitionAlert && (
          <div className="my-[18px] border border-[var(--accent)] px-[18px] py-[14px] font-mono text-[.78rem] font-bold tracking-[.05em] text-accent-dark uppercase" role="alert" aria-live="assertive">
            Transition soon. {current?.title} ends in {formatDuration(metrics.currentRemainingMs)}.
          </div>
        )}

        <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(280px,.65fr)] border-b border-[var(--line)] max-[760px]:block">
          <section className="py-[34px] pr-[clamp(24px,6vw,92px)] border-r border-[var(--line)] max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:pr-0" >
            <div className="mb-7 flex justify-between font-mono text-[.66rem] tracking-[.06em] text-ink-soft uppercase">
              <span>Current item</span>
              <span>{current ? `${currentIndex + 1} / ${state.items.length}` : "No item active"}</span>
            </div>
            {current ? (
              <>
                <h2 className="mb-3 text-[clamp(2.2rem,5vw,5rem)] leading-[.9]">{current.title}</h2>
                {current.notes && <p className="mb-8 max-w-[50ch] leading-[1.5] text-ink-soft">{current.notes}</p>}
                <div className="my-[30px] mb-[34px] grid min-h-[190px] place-items-center border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-6 text-center">
                  <span className="font-mono text-[.7rem] tracking-[.12em] text-accent uppercase">
                    {metrics.currentRemainingMs < 0 ? "Current period overtime" : "Current period time remaining"}
                  </span>
                  <strong className="text-[clamp(4rem,10vw,9rem)] font-semibold leading-[.85] tracking-[-.1em]">
                    {formatDuration(Math.abs(metrics.currentRemainingMs))}
                  </strong>
                </div>
                <div className="mb-[34px] grid grid-cols-3 gap-[18px] max-[760px]:gap-3">
                  <div className="flex flex-col gap-2"><span className={metaClass}>Actual elapsed</span><strong className="text-[1.55rem] tracking-[-.05em] max-[760px]:text-[1.15rem]">{formatDuration(metrics.currentElapsedMs)}</strong></div>
                  <div className="flex flex-col gap-2"><span className={metaClass}>Planned duration</span><strong className="text-[1.55rem] tracking-[-.05em] max-[760px]:text-[1.15rem]">{formatDuration(plannedDuration(current))}</strong></div>
                  <div className={`flex flex-col gap-2 ${metrics.currentRemainingMs < 0 ? "text-accent-dark" : ""}`}><span className={metaClass}>{metrics.currentRemainingMs < 0 ? "Overtime" : "Time remaining"}</span><strong className="text-[1.55rem] tracking-[-.05em] max-[760px]:text-[1.15rem]">{formatDuration(Math.abs(metrics.currentRemainingMs))}</strong></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className={buttonClass} onClick={() => moveTo(-1)}>Previous</button>
                  <button className={buttonClass} onClick={() => finishItem(true)}>Skip item</button>
                  <button className={primaryButtonClass} onClick={() => finishItem(false)}>Mark complete</button>
                  <button className={buttonClass} onClick={() => moveTo(1)}>Next item</button>
                </div>
              </>
            ) : (
              <div className="py-8 text-ink-soft">
                <p>Start an item manually or start the event to begin tracking.</p>
                <button className={primaryButtonClass} onClick={() => startItem(next?.id)}>Start first item</button>
              </div>
            )}
          </section>
          <aside className="py-[34px] pl-[clamp(24px,6vw,92px)] max-[760px]:pl-0">
            <div className="mb-7 flex justify-between font-mono text-[.66rem] tracking-[.06em] text-ink-soft uppercase">
              <span>Event budget</span><span>{formatDuration(eventDuration(state))}</span>
            </div>
            <div className="my-[22px] mb-[14px] text-[clamp(3rem,7vw,6.8rem)] font-semibold leading-[.85] tracking-[-.1em]">{formatDuration(metrics.eventRemainingMs)}</div>
            <p className="mb-[18px] max-w-[28ch] font-mono text-[.66rem] leading-[1.6] text-ink-soft">
              Time remaining in the planned {formatDuration(eventDuration(state))} event budget. The wall clock does not delay practice starts.
            </p>
            {metrics.itemOvertimeMs > 0 && <p className="text-accent-dark">Current item is {formatDuration(metrics.itemOvertimeMs)} over its plan.</p>}
            {metrics.projectedOvertimeMs > 0 && <p className="text-accent-dark">Projected finish is {formatDuration(metrics.projectedOvertimeMs)} beyond the event budget.</p>}
          </aside>
        </div>

        <section className="grid grid-cols-[minmax(220px,.7fr)_minmax(240px,1.3fr)] items-center gap-5 border-b border-[var(--line)] py-8 max-[760px]:grid-cols-1">
          <div>
            <p className={eyebrowClass}>Practice controls</p>
            <h2 className="mb-[6px] text-[1.4rem]">Seek the schedule</h2>
            <p className="mb-0 text-[.85rem] text-ink-soft">Jump to any rundown item and begin timing it now.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.items.map((item, index) => (
              <button key={item.id} className={cn(buttonClass, item.id === state.currentItemId && primaryButtonClass)} onClick={() => seekToItem(item.id)}>
                {index + 1}. {item.title}
              </button>
            ))}
          </div>
        </section>

        <section className="border-b border-[var(--line)] py-[54px]">
          <div className={sectionHeadingClass}>
            <div><p className={eyebrowClass}>Original plan</p><h2 className="mb-0 text-[clamp(2.4rem,5vw,4.8rem)] leading-[.9]">Rundown</h2></div>
            <Link className={buttonClass} href="/timekeeper">Edit setup</Link>
          </div>
          <div className="border-t border-[var(--line)]">
            {state.items.map((item, index) => (
              <article key={item.id} className={`relative grid min-h-[72px] grid-cols-[42px_minmax(0,1fr)_150px_100px_auto] items-center gap-5 border-b border-[var(--line)] py-[14px] max-[760px]:grid-cols-[32px_minmax(0,1fr)_auto] max-[760px]:gap-[10px] ${item.id === state.currentItemId ? "border-l-[3px] border-l-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] pl-3" : ""} ${item.status === "skipped" ? "opacity-50" : ""}`}>
                <span className={metaClass}>{String(index + 1).padStart(2, "0")}</span>
                <div className="flex flex-col gap-1"><strong className="text-[1.05rem]">{item.title}</strong>{item.notes && <span className="text-[.82rem] text-ink-soft">{item.notes}</span>}</div>
                <div className="flex flex-col gap-1 font-mono text-[.72rem] max-[760px]:col-start-2">
                  <span>{item.plannedStart} - {item.plannedEnd}</span>
                  <small className={metaClass}>{formatDuration(plannedDuration(item))}</small>
                </div>
                <span className={`${metaClass} max-[760px]:col-start-3 max-[760px]:row-start-1`}>{item.status}</span>
                <div className="flex justify-end gap-[5px] max-[760px]:col-[2/-1] max-[760px]:justify-start">
                  {item.status === "pending" && <button className="border-0 border-b border-[var(--ink)] bg-transparent font-mono text-[.7rem]" onClick={() => startItem(item.id)}>Start</button>}
                  {item.status === "running" && <button className="border-0 border-b border-[var(--ink)] bg-transparent font-mono text-[.7rem]" onClick={() => finishItem(false)}>Finish</button>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex justify-between gap-5 pt-[22px] font-mono text-[.66rem] tracking-[.06em] text-ink-soft uppercase max-[760px]:items-start max-[760px]:flex-col">
          <div className="flex gap-4 max-[760px]:flex-col">
            <button className="border-0 bg-transparent font-[inherit] text-accent-dark underline" onClick={restartEvent}>Restart event</button>
            <button className="border-0 bg-transparent font-[inherit] text-accent-dark underline" onClick={resetElapsedTime}>Reset elapsed time</button>
            <button className="border-0 bg-transparent font-[inherit] text-accent-dark underline" onClick={reset}>Reset event</button>
          </div>
          <Link href="/timekeeper">Back to setup</Link>
        </footer>
      </div>
    </main>
  );
}
