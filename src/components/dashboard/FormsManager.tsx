"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { FormRecord } from "@/lib/forms/types";

type FormTab = "active" | "past" | "drafts";

const tabs: { id: FormTab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "past", label: "Past" },
  { id: "drafts", label: "Drafts" },
];

const formDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function FormsManager({
  initialForms,
  initialError = "",
}: {
  initialForms: FormRecord[];
  initialError?: string;
}) {
  const router = useRouter();
  const [forms, setForms] = useState(initialForms);
  const [activeTab, setActiveTab] = useState<FormTab>("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [description, setDescription] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForms(initialForms);
  }, [initialForms]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (modalOpen && !dialog.open) {
      dialog.showModal();
      nameInputRef.current?.focus();
    } else if (!modalOpen && dialog.open) {
      dialog.close();
    }
  }, [modalOpen]);

  const today = new Date().toISOString().slice(0, 10);
  const visibleForms = forms.filter((form) => {
    if (activeTab === "drafts") return form.status === "draft";
    if (form.status !== "published") return false;
    const isPast = Boolean(form.close_date && form.close_date < today);
    return activeTab === "past" ? isPast : !isPast;
  });
  const counts = {
    active: forms.filter(
      (form) =>
        form.status === "published" &&
        (!form.close_date || form.close_date >= today),
    ).length,
    past: forms.filter(
      (form) =>
        form.status === "published" &&
        Boolean(form.close_date && form.close_date < today),
    ).length,
    drafts: forms.filter((form) => form.status === "draft").length,
  };

  const closeModal = () => {
    if (creating) return;
    setModalOpen(false);
    setError("");
    setFormName("");
    setDescription("");
    setCloseDate("");
  };

  const createForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formName,
          description,
          close_date: closeDate || null,
        }),
      });
      const result: { form?: { id?: unknown }; error?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || typeof result.form?.id !== "string") {
        setError(result.error ?? "Could not create the form. Please try again.");
        setCreating(false);
        return;
      }

      router.push(`/form/${result.form.id}/edit`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setCreating(false);
    }
  };

  const refreshForms = () => router.refresh();

  return (
    <div className="forms-workspace">
      <header className="dashboard-page-header forms-page-header">
        <div>
          <p className="dashboard-eyebrow">Workspace / Forms</p>
          <h1>Your forms</h1>
          <p className="dashboard-page-description">
            Build and manage forms in one place.
          </p>
        </div>
        <button
          type="button"
          className="dashboard-primary-button"
          onClick={() => {
            setError("");
            setModalOpen(true);
          }}
        >
          <span aria-hidden="true">+</span>
          Create form
        </button>
      </header>

      {initialError && (
        <div className="dashboard-alert" role="alert">
          <span>{initialError}</span>
          <button type="button" onClick={refreshForms}>
            Retry
          </button>
        </div>
      )}

      <section className="forms-section" aria-label="Forms">
        <div className="forms-toolbar">
          <div className="forms-tabs" role="group" aria-label="Filter forms by status">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={activeTab === tab.id}
                className={`forms-tab ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span>{counts[tab.id]}</span>
              </button>
            ))}
          </div>
          <span className="forms-count">
            {visibleForms.length} {visibleForms.length === 1 ? "form" : "forms"}
          </span>
        </div>

        {visibleForms.length > 0 ? (
          <div className="forms-grid">
            {visibleForms.map((form) => {
              const isPast =
                form.status === "published" &&
                Boolean(form.close_date && form.close_date < today);
              return (
                <article className="form-card" key={form.id}>
                  <div className="form-card-top">
                    <span className={`form-status is-${isPast ? "past" : form.status}`}>
                      <span aria-hidden="true" />
                      {isPast ? "past" : form.status}
                    </span>
                    {form.close_date && (
                      <span className="form-card-date">
                        Closes{" "}
                        {formDateFormatter.format(
                          new Date(`${form.close_date}T00:00:00Z`),
                        )}
                      </span>
                    )}
                  </div>
                  <div className="form-card-copy">
                    <h2>{form.title}</h2>
                    <p>{form.description || "No description added yet."}</p>
                  </div>
                  <div className="form-card-footer">
                    <span>{form.fields.length} questions</span>
                    <Link href={`/form/${form.id}/edit`} className="form-card-link">
                      Edit form <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="forms-empty-state">
            <span className="forms-empty-icon" aria-hidden="true">
              ▤
            </span>
            <h2>
              {activeTab === "drafts"
                ? "No drafts yet"
                : activeTab === "past"
                  ? "No past forms"
                  : "No active forms yet"}
            </h2>
            <p>
              {activeTab === "drafts"
                ? "New forms stay as drafts until you publish them."
                : activeTab === "past"
                  ? "Published forms past their closing date will appear here."
                  : "Publish a form to make it active in your workspace."}
            </p>
            {activeTab === "drafts" && (
              <button
                type="button"
                className="dashboard-primary-button"
                onClick={() => setModalOpen(true)}
              >
                Create a form
              </button>
            )}
          </div>
        )}
      </section>

      <dialog
        ref={dialogRef}
        className="create-form-dialog"
        aria-labelledby="create-form-title"
        onCancel={(event) => {
          event.preventDefault();
          closeModal();
        }}
        onClose={() => setModalOpen(false)}
      >
        <div className="create-form-dialog-header">
          <div>
            <p className="dashboard-eyebrow">New workspace item</p>
            <h2 id="create-form-title">Create a form</h2>
          </div>
          <button
            type="button"
            className="dialog-close-button"
            aria-label="Close dialog"
            onClick={closeModal}
          >
            ×
          </button>
        </div>

        <form className="create-form-form" onSubmit={createForm}>
          <label>
            Form name <span aria-hidden="true">*</span>
            <input
              ref={nameInputRef}
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
              maxLength={120}
              placeholder="e.g. Customer feedback"
              required
            />
          </label>
          <label>
            Description <span className="form-optional">Optional</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="What is this form for?"
            />
          </label>
          <label>
            Closing date <span className="form-optional">Optional</span>
            <input
              type="date"
              value={closeDate}
              onChange={(event) => setCloseDate(event.target.value)}
            />
          </label>

          <div className="draft-note">
            <span className="draft-note-dot" aria-hidden="true" />
            This form will be created as a draft. You can publish it from the editor.
          </div>

          {error && (
            <p className="dashboard-alert-message" role="alert">
              {error}
            </p>
          )}

          <div className="create-form-actions">
            <button
              type="button"
              className="dashboard-secondary-button"
              onClick={closeModal}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dashboard-primary-button"
              disabled={creating || !formName.trim()}
            >
              {creating ? "Creating…" : "Create draft"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
