"use client";

import Link from "next/link";
import { formatDuration, plannedDuration } from "@/lib/timekeeper";
import { cn } from "@/lib/utils";
import { useTimekeeper } from "./useTimekeeper";

const buttonClass =
  "min-h-10 border border-[var(--line)] bg-transparent px-[14px] py-[10px] font-sans text-[.78rem] font-semibold text-ink transition-[transform,background-color,color,border-color] duration-150 hover:border-[var(--ink)] hover:bg-[var(--paper-deep)] active:translate-y-px active:scale-[.98]";
const primaryButtonClass = cn(
  buttonClass,
  "border-[var(--ink)] bg-[var(--ink)] text-paper hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-paper",
);
const fieldClass =
  "flex flex-col gap-2 font-mono text-[.66rem] tracking-[.06em] text-ink-soft uppercase";
const inputClass =
  "min-h-[42px] w-full border border-[var(--line)] bg-[var(--paper-deep)] px-[10px] py-[9px] font-sans text-[.9rem] text-ink normal-case";
const eyebrowClass =
  "mb-[22px] font-mono text-[.68rem] tracking-[.12em] text-accent uppercase";
const sectionHeadingClass =
  "mb-[30px] flex items-end justify-between gap-6 max-[760px]:items-start max-[760px]:flex-col";

export default function TimekeeperSetupPage() {
  const timekeeper = useTimekeeper();
  const {
    state,
    warnings,
    editing,
    setEditing,
    updateItem,
    moveItem,
    deleteItem,
    addItem,
    exportJson,
    importJson,
    importError,
  } = timekeeper;

  return (
    <main className="min-h-dvh bg-[var(--paper)] text-ink">
      <header className="grid min-h-[76px] grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-6 border-b border-[var(--line)] px-[max(24px,calc((100%-1320px)/2))] py-4 max-[760px]:grid-cols-[1fr_auto]">
        <Link href="/" className="w-fit text-[1.35rem] font-extrabold tracking-[-.08em]" aria-label="Back to Louie Hansen home">
          LH<span className="text-accent">.</span>
        </Link>
        <div className="flex flex-col gap-1 font-mono text-[.68rem] tracking-[.08em] uppercase max-[760px]:hidden">
          <span>Timekeeper setup</span>
          <strong className="font-sans text-base tracking-[-.03em] normal-case">{state.name}</strong>
        </div>
        <Link href="/timekeeper/live" className={`${primaryButtonClass} justify-self-end text-center`}>
          Open live view
        </Link>
      </header>

      <div className="mx-auto w-[min(1320px,calc(100%-48px))] pt-[70px] pb-11 max-[760px]:w-[min(100%-32px,1320px)] max-[760px]:pt-10">
        <section className="border-b border-[var(--line)] py-[54px] first:pt-0">
          <p className={eyebrowClass}>Before the event</p>
          <h1 className="mb-[18px] max-w-[700px] text-[clamp(2.8rem,6vw,6rem)] leading-[.9]">Build the rundown.</h1>
          <p className="m-0 max-w-[50ch] text-[.75rem] leading-[1.5] text-ink-soft">
            Set the original plan here. Actual timings are recorded separately in the live view.
          </p>
        </section>

        <section className="border-b border-[var(--line)] py-[54px]">
          <div className={sectionHeadingClass}>
            <div>
              <p className={eyebrowClass}>Configuration</p>
              <h2 className="mb-0 text-[clamp(2.4rem,5vw,4.8rem)] leading-[.9]">Event details</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className={buttonClass} onClick={exportJson}>Export JSON</button>
              <label className={`${buttonClass} cursor-pointer`}>
                Import JSON
                <input
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={(event) => importJson(event.target.files?.[0])}
                />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-[2fr_repeat(3,1fr)] gap-[14px] max-[760px]:grid-cols-2 max-[760px]:[&>label:first-child]:col-span-full">
            <label className={fieldClass}>Event name<input className={inputClass} value={state.name} onChange={(event) => timekeeper.setState((previous) => ({ ...previous, name: event.target.value }))} /></label>
            <label className={fieldClass}>Date<input className={inputClass} type="date" value={state.date} onChange={(event) => timekeeper.setState((previous) => ({ ...previous, date: event.target.value }))} /></label>
            <label className={fieldClass}>Planned start<input className={inputClass} type="time" value={state.plannedStart} onChange={(event) => timekeeper.setState((previous) => ({ ...previous, plannedStart: event.target.value }))} /></label>
            <label className={fieldClass}>Planned end<input className={inputClass} type="time" value={state.plannedEnd} onChange={(event) => timekeeper.setState((previous) => ({ ...previous, plannedEnd: event.target.value }))} /></label>
          </div>
          {warnings.length > 0 && (
            <div className="mt-[22px] border-l-[3px] border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-4" role="alert">
              <strong className="text-[.9rem]">Check the planned schedule</strong>
              <ul className="mt-2 mb-0 pl-[18px] text-[.85rem] text-ink-soft">
                {warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            </div>
          )}
          {importError && <p className="text-accent-dark">{importError}</p>}
        </section>

        <section className="border-b border-[var(--line)] py-[54px]">
          <div className={sectionHeadingClass}>
            <div>
              <p className={eyebrowClass}>Original plan</p>
              <h2 className="mb-0 text-[clamp(2.4rem,5vw,4.8rem)] leading-[.9]">Rundown</h2>
            </div>
            <button className={primaryButtonClass} onClick={addItem}>Add item</button>
          </div>
          <div className="border-t border-[var(--line)]">
            {state.items.map((item, index) => (
              <article key={item.id} className="relative grid min-h-[72px] grid-cols-[42px_minmax(0,1fr)_150px_100px_auto] items-center gap-5 border-b border-[var(--line)] py-[14px] max-[760px]:grid-cols-[32px_minmax(0,1fr)_auto] max-[760px]:gap-[10px]">
                <span className="font-mono text-[.66rem] text-ink-soft">{String(index + 1).padStart(2, "0")}</span>
                <div className="flex flex-col gap-1">
                  <strong className="text-[1.05rem]">{item.title}</strong>
                  {item.notes && <span className="text-[.82rem] text-ink-soft">{item.notes}</span>}
                </div>
                <div className="flex flex-col gap-1 font-mono text-[.72rem] max-[760px]:col-start-2">
                  <span>{item.plannedStart} - {item.plannedEnd}</span>
                  <small className="font-mono text-[.66rem] tracking-[.06em] text-ink-soft uppercase">{formatDuration(plannedDuration(item))}</small>
                </div>
                <span className="font-mono text-[.66rem] text-ink-soft max-[760px]:col-start-3 max-[760px]:row-start-1">{item.status}</span>
                <div className="flex justify-end gap-[5px] max-[760px]:col-[2/-1] max-[760px]:justify-start">
                  <button className="border-0 border-b border-[var(--ink)] bg-transparent font-mono text-[.7rem] text-ink" onClick={() => moveItem(item.id, -1)}>Up</button>
                  <button className="border-0 border-b border-[var(--ink)] bg-transparent font-mono text-[.7rem] text-ink" onClick={() => moveItem(item.id, 1)}>Down</button>
                  <button className="border-0 border-b border-[var(--ink)] bg-transparent font-mono text-[.7rem] text-ink" onClick={() => setEditing(editing === item.id ? null : item.id)}>{editing === item.id ? "Done" : "Edit"}</button>
                </div>
                {editing === item.id && (
                  <div className="col-[2/-1] grid grid-cols-[1.4fr_1.4fr_120px_120px_auto] gap-[10px] pt-4 pb-1 max-[760px]:col-[1/-1] max-[760px]:grid-cols-2">
                    <label className={fieldClass}>Title<input className={inputClass} value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} /></label>
                    <label className={fieldClass}>Notes<input className={inputClass} value={item.notes} onChange={(event) => updateItem(item.id, { notes: event.target.value })} /></label>
                    <label className={fieldClass}>Start<input className={inputClass} type="time" value={item.plannedStart} onChange={(event) => updateItem(item.id, { plannedStart: event.target.value })} /></label>
                    <label className={fieldClass}>End<input className={inputClass} type="time" value={item.plannedEnd} onChange={(event) => updateItem(item.id, { plannedEnd: event.target.value })} /></label>
                    <button className="text-accent-dark" onClick={() => deleteItem(item.id)}>Delete</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <footer className="flex justify-between gap-5 pt-[22px] font-mono text-[.66rem] tracking-[.06em] text-ink-soft uppercase max-[760px]:items-start max-[760px]:flex-col">
          <button className="border-0 bg-transparent font-[inherit] text-accent-dark underline" onClick={timekeeper.reset}>Reset event</button>
          <span>Configuration and actual timings are saved locally in this browser.</span>
        </footer>
      </div>
    </main>
  );
}
