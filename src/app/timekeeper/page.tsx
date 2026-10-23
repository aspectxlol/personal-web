"use client";

import Link from "next/link";
import { formatDuration, plannedDuration } from "@/lib/timekeeper";
import { useTimekeeper } from "./useTimekeeper";

export default function TimekeeperSetupPage() {
  const timekeeper = useTimekeeper();
  const { state, warnings, editing, setEditing, updateItem, moveItem, deleteItem, addItem, exportJson, importJson, importError } = timekeeper;

  return (
    <main className="timekeeper-page">
      <header className="tk-header"><Link href="/" className="brand-mark" aria-label="Back to Louie Hansen home">LH<span>.</span></Link><div className="tk-header-title"><span>Timekeeper setup</span><strong>{state.name}</strong></div><Link href="/timekeeper/live" className="tk-button tk-button-primary">Open live view</Link></header>
      <div className="tk-shell">
        <section className="tk-setup tk-setup-hero"><p className="eyebrow">Before the event</p><h1>Build the rundown.</h1><p className="tk-lede">Set the original plan here. Actual timings are recorded separately in the live view.</p></section>
        <section className="tk-setup"><div className="tk-section-heading"><div><p className="eyebrow">Configuration</p><h2>Event details</h2></div><div className="tk-toolbar"><button className="tk-button" onClick={exportJson}>Export JSON</button><label className="tk-button">Import JSON<input type="file" accept="application/json" hidden onChange={(event) => importJson(event.target.files?.[0])} /></label></div></div><div className="tk-form-grid"><label>Event name<input value={state.name} onChange={(event) => timekeeper.setState((previous) => ({ ...previous, name: event.target.value }))} /></label><label>Date<input type="date" value={state.date} onChange={(event) => timekeeper.setState((previous) => ({ ...previous, date: event.target.value }))} /></label><label>Planned start<input type="time" value={state.plannedStart} onChange={(event) => timekeeper.setState((previous) => ({ ...previous, plannedStart: event.target.value }))} /></label><label>Planned end<input type="time" value={state.plannedEnd} onChange={(event) => timekeeper.setState((previous) => ({ ...previous, plannedEnd: event.target.value }))} /></label></div>{warnings.length > 0 && <div className="tk-validation" role="alert"><strong>Check the planned schedule</strong><ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}{importError && <p className="tk-error">{importError}</p>}</section>
        <section className="tk-rundown"><div className="tk-section-heading"><div><p className="eyebrow">Original plan</p><h2>Rundown</h2></div><button className="tk-button tk-button-primary" onClick={addItem}>Add item</button></div><div className="tk-rundown-list">{state.items.map((item, index) => <article key={item.id} className="tk-rundown-item"><span className="tk-item-index">{String(index + 1).padStart(2, "0")}</span><div className="tk-item-main"><strong>{item.title}</strong>{item.notes && <span>{item.notes}</span>}</div><div className="tk-item-plan"><span>{item.plannedStart} - {item.plannedEnd}</span><small>{formatDuration(plannedDuration(item))}</small></div><span className="tk-item-status">{item.status}</span><div className="tk-item-actions"><button onClick={() => moveItem(item.id, -1)}>Up</button><button onClick={() => moveItem(item.id, 1)}>Down</button><button onClick={() => setEditing(editing === item.id ? null : item.id)}>{editing === item.id ? "Done" : "Edit"}</button></div>{editing === item.id && <div className="tk-item-editor"><label>Title<input value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} /></label><label>Notes<input value={item.notes} onChange={(event) => updateItem(item.id, { notes: event.target.value })} /></label><label>Start<input type="time" value={item.plannedStart} onChange={(event) => updateItem(item.id, { plannedStart: event.target.value })} /></label><label>End<input type="time" value={item.plannedEnd} onChange={(event) => updateItem(item.id, { plannedEnd: event.target.value })} /></label><button className="tk-danger" onClick={() => deleteItem(item.id)}>Delete</button></div>}</article>)}</div></section>
        <footer className="tk-footer"><button className="tk-danger" onClick={timekeeper.reset}>Reset event</button><span>Configuration and actual timings are saved locally in this browser.</span></footer>
      </div>
    </main>
  );
}
