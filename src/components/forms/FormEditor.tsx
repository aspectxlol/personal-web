"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FORM_FIELD_TYPES,
  type FormField,
  type FormFieldType,
  type FormRecord,
  type FormStatus,
} from "@/lib/forms/types";

const fieldLabels: Record<FormFieldType, string> = {
  short_text: "Short answer",
  long_text: "Long answer",
  email: "Email address",
  checkbox: "Checkbox",
};

export function FormEditor({ initialForm }: { initialForm: FormRecord }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const updateField = (id: string, patch: Partial<FormField>) => {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.id === id ? { ...field, ...patch } : field,
      ),
    }));
  };

  const addField = (type: FormFieldType) => {
    const field: FormField = {
      id: crypto.randomUUID(),
      label: `Question ${form.fields.length + 1}`,
      type,
      required: false,
    };
    setForm((current) => ({ ...current, fields: [...current.fields, field] }));
    setNotice("");
  };

  const removeField = (id: string) => {
    setForm((current) => ({
      ...current,
      fields: current.fields.filter((field) => field.id !== id),
    }));
    setNotice("");
  };

  const save = async (status: FormStatus = form.status) => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updates: {
        title: string;
        description: string;
        fields: FormField[];
        status?: FormStatus;
      } = {
        title: form.title,
        description: form.description,
        fields: form.fields,
      };
      if (status !== form.status) updates.status = status;

      const response = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const result: { form?: FormRecord; error?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || !result.form) {
        setError(result.error ?? "Could not save this form. Please try again.");
        setSaving(false);
        return;
      }

      setForm(result.form);
      setNotice(status === "published" ? "Form published." : "Changes saved.");
      setSaving(false);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setSaving(false);
    }
  };

  const togglePublish = () => {
    void save(form.status === "published" ? "draft" : "published");
  };

  return (
    <div className="form-editor">
      <header className="form-editor-header">
        <div className="form-editor-heading">
          <Link href="/dashboard/forms" className="form-editor-back">
            <span aria-hidden="true">←</span> Forms
          </Link>
          <div className="form-editor-title-row">
            <input
              aria-label="Form name"
              className="form-editor-title-input"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              maxLength={120}
            />
            <span className={`form-status is-${form.status}`}>
              <span aria-hidden="true" />
              {form.status}
            </span>
          </div>
          <p className="dashboard-page-description">
            Edit questions and settings. Changes stay private until you publish.
          </p>
        </div>
        <div className="form-editor-actions">
          {notice && <span className="form-editor-notice" role="status">{notice}</span>}
          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={() => void save()}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            className={form.status === "published" ? "dashboard-secondary-button" : "dashboard-primary-button"}
            onClick={togglePublish}
            disabled={
              saving ||
              !form.title.trim() ||
              (form.status === "draft" && form.fields.length === 0)
            }
          >
            {saving
              ? "Saving…"
              : form.status === "published"
                ? "Unpublish"
                : "Publish form"}
          </button>
        </div>
      </header>

      {form.status === "draft" && form.fields.length === 0 && (
        <p className="form-publish-hint">
          Add at least one question before publishing.
        </p>
      )}

      {error && (
        <div className="dashboard-alert" role="alert">
          {error}
        </div>
      )}

      <div className="form-editor-layout">
        <section className="form-builder-panel" aria-labelledby="questions-heading">
          <div className="form-builder-heading">
            <div>
              <p className="dashboard-eyebrow">Form builder</p>
              <h2 id="questions-heading">Questions</h2>
            </div>
            <label className="dashboard-secondary-button form-add-select">
              <span aria-hidden="true">+</span> Add question
              <select
                aria-label="Choose a question type to add"
                value=""
                onChange={(event) => {
                  if (event.target.value) addField(event.target.value as FormFieldType);
                }}
              >
                <option value="" disabled>
                  Choose question type
                </option>
                {FORM_FIELD_TYPES.map((type) => (
                  <option value={type} key={type}>
                    {fieldLabels[type]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {form.fields.length > 0 ? (
            <div className="form-field-list">
              {form.fields.map((field, index) => (
                <article className="form-field-card" key={field.id}>
                  <div className="form-field-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="form-field-content">
                    <div className="form-field-topline">
                      <span>{fieldLabels[field.type]}</span>
                      <button
                        type="button"
                        className="form-field-delete"
                        onClick={() => removeField(field.id)}
                        aria-label={`Remove ${field.label}`}
                      >
                        Remove
                      </button>
                    </div>
                    <label className="form-field-label">
                      Question label
                      <input
                        value={field.label}
                        onChange={(event) =>
                          updateField(field.id, { label: event.target.value })
                        }
                        maxLength={120}
                      />
                    </label>
                    <div className="form-field-preview">
                      {field.type === "checkbox" ? (
                        <label className="form-checkbox-preview">
                          <input type="checkbox" disabled />
                          {field.label || "Checkbox option"}
                        </label>
                      ) : field.type === "long_text" ? (
                        <textarea disabled placeholder="Long answer" rows={3} />
                      ) : (
                        <input
                          disabled
                          type={field.type === "email" ? "email" : "text"}
                          placeholder={field.type === "email" ? "name@example.com" : "Short answer"}
                        />
                      )}
                    </div>
                    <label className="form-required-toggle">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(event) =>
                          updateField(field.id, { required: event.target.checked })
                        }
                      />
                      Required question
                    </label>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="form-builder-empty">
              <span className="forms-empty-icon" aria-hidden="true">＋</span>
              <h3>Start with a question</h3>
              <p>Add a question to begin building your form.</p>
              <label className="dashboard-primary-button form-add-select">
                Add your first question
                <select
                  aria-label="Choose the first question type"
                  value=""
                  onChange={(event) => {
                    if (event.target.value) addField(event.target.value as FormFieldType);
                  }}
                >
                  <option value="" disabled>Choose question type</option>
                  {FORM_FIELD_TYPES.map((type) => (
                    <option value={type} key={type}>{fieldLabels[type]}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </section>

        <aside className="form-settings-panel" aria-labelledby="settings-heading">
          <div className="form-settings-heading">
            <p className="dashboard-eyebrow">Configuration</p>
            <h2 id="settings-heading">Form settings</h2>
          </div>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={4}
              maxLength={2000}
              placeholder="Tell people what this form is about."
            />
          </label>
          <div className="form-settings-status">
            <span>Status</span>
            <strong>{form.status === "published" ? "Active" : "Draft"}</strong>
            <p>
              {form.status === "draft"
                ? "Only you can see this draft. Publish when it is ready."
                : "This form is published and available to fill out."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
