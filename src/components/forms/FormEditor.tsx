"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";
import {
  FORM_FIELD_TYPES,
  type FormSettings,
  type FormField,
  type FormFieldType,
  type FormRecord,
  type FormStatus,
} from "@/lib/forms/types";
import { defaultFormSettings } from "@/lib/forms/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const fieldLabels: Record<FormFieldType, string> = {
  short_text: "Short answer",
  long_text: "Long answer",
  email: "Email address",
  checkbox: "Checkbox",
};

type FormSettingsPatch = {
  presentation?: Partial<FormSettings["presentation"]>;
  respondentAccess?: Partial<FormSettings["respondentAccess"]>;
};

function QuestionTypeMenu({
  label,
  onSelect,
  variant = "secondary",
}: {
  label: string;
  onSelect: (type: FormFieldType) => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "primary" ? "default" : "outline"}
          className="question-type-trigger"
        >
          <span aria-hidden="true">+</span>
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="question-type-options">
        <DropdownMenuLabel>Choose question type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {FORM_FIELD_TYPES.map((type) => (
          <DropdownMenuItem
            key={type}
            onSelect={() => onSelect(type)}
          >
            {fieldLabels[type]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FormEditor({ initialForm }: { initialForm: FormRecord }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [settings, setSettings] = useState(
    initialForm.draft_definition?.settings ?? defaultFormSettings,
  );
  const [acceptingResponses, setAcceptingResponses] = useState(
    initialForm.accepting_responses ?? true,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);

  const updateSettings = (patch: FormSettingsPatch) => {
    setSettings((current) => ({
      ...current,
      ...patch,
      presentation: patch.presentation
        ? { ...current.presentation, ...patch.presentation }
        : current.presentation,
      respondentAccess: patch.respondentAccess
        ? { ...current.respondentAccess, ...patch.respondentAccess }
        : current.respondentAccess,
    }));
  };

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

  const reorderField = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setForm((current) => {
      const sourceIndex = current.fields.findIndex((field) => field.id === sourceId);
      const targetIndex = current.fields.findIndex((field) => field.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;

      const fields = [...current.fields];
      const [moved] = fields.splice(sourceIndex, 1);
      fields.splice(targetIndex, 0, moved);
      return { ...current, fields };
    });
    setNotice("");
  };

  const moveField = (id: string, offset: -1 | 1) => {
    const index = form.fields.findIndex((field) => field.id === id);
    const target = form.fields[index + offset];
    if (target) reorderField(id, target.id);
  };

  const handleFieldDrop = (
    event: DragEvent<HTMLElement>,
    targetId: string,
  ) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain");
    if (sourceId) reorderField(sourceId, targetId);
    setDraggedFieldId(null);
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
        settings: FormSettings;
        accepting_responses: boolean;
        status?: FormStatus;
      } = {
        title: form.title,
        description: form.description ?? "",
        fields: form.fields,
        settings,
        accepting_responses: acceptingResponses,
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
      setSettings(
        result.form.draft_definition?.settings ?? defaultFormSettings,
      );
      setAcceptingResponses(result.form.accepting_responses ?? true);
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
            <Input
              aria-label="Form name"
              className="form-editor-title-input"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              maxLength={120}
            />
            <Badge variant={form.status === "published" ? "default" : "secondary"} className="form-status">
              <span aria-hidden="true" />
              {form.status}
            </Badge>
          </div>
          <p className="dashboard-page-description">
            Edit questions and settings. Changes stay private until you publish.
          </p>
        </div>
        <div className="form-editor-actions">
          {notice && <span className="form-editor-notice" role="status">{notice}</span>}
          <Button
            type="button"
            variant="outline"
            onClick={() => void save()}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant={form.status === "published" ? "outline" : "default"}
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
          </Button>
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
            <QuestionTypeMenu label="Add question" onSelect={addField} />
          </div>

          {form.fields.length > 0 ? (
            <div className="form-field-list">
              {form.fields.map((field, index) => (
                <Card
                  className={`form-field-card ${draggedFieldId === field.id ? "is-dragging" : ""}`}
                  key={field.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleFieldDrop(event, field.id)}
                >
                  <div className="form-field-controls">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="form-field-drag-handle"
                      draggable
                      aria-label={`Drag to reorder ${field.label}`}
                      title="Drag to reorder"
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", field.id);
                        event.dataTransfer.effectAllowed = "move";
                        setDraggedFieldId(field.id);
                      }}
                      onDragEnd={() => setDraggedFieldId(null)}
                    >
                      <span aria-hidden="true">⠿</span>
                    </Button>
                    <span className="form-field-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="form-field-move-buttons">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Move ${field.label} up`}
                        disabled={index === 0}
                        onClick={() => moveField(field.id, -1)}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Move ${field.label} down`}
                        disabled={index === form.fields.length - 1}
                        onClick={() => moveField(field.id, 1)}
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                  <div className="form-field-content">
                    <div className="form-field-topline">
                      <span>{fieldLabels[field.type]}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="form-field-delete"
                        onClick={() => removeField(field.id)}
                        aria-label={`Remove ${field.label}`}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="form-field-label">
                      <Label htmlFor={`question-${field.id}`}>Question label</Label>
                      <Input
                        id={`question-${field.id}`}
                        value={field.label}
                        onChange={(event) =>
                          updateField(field.id, { label: event.target.value })
                        }
                        maxLength={120}
                      />
                    </div>
                    <div className="form-field-preview">
                      {field.type === "checkbox" ? (
                        <div className="form-checkbox-preview">
                          <Checkbox disabled aria-hidden="true" />
                          {field.label || "Checkbox option"}
                        </div>
                      ) : field.type === "long_text" ? (
                        <Textarea disabled placeholder="Long answer" rows={3} />
                      ) : (
                        <Input
                          disabled
                          type={field.type === "email" ? "email" : "text"}
                          placeholder={field.type === "email" ? "name@example.com" : "Short answer"}
                        />
                      )}
                    </div>
                    <div className="form-required-toggle">
                      <Checkbox
                        id={`required-${field.id}`}
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          updateField(field.id, { required: checked === true })
                        }
                      />
                      <Label htmlFor={`required-${field.id}`}>Required question</Label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="form-builder-empty">
              <span className="forms-empty-icon" aria-hidden="true">＋</span>
              <h3>Start with a question</h3>
              <p>Add a question to begin building your form.</p>
              <QuestionTypeMenu
                label="Add your first question"
                variant="primary"
                onSelect={addField}
              />
            </div>
          )}
        </section>

        <aside className="form-settings-panel" aria-labelledby="settings-heading">
          <div className="form-settings-heading">
            <p className="dashboard-eyebrow">Configuration</p>
            <h2 id="settings-heading">Form settings</h2>
          </div>
          <div className="form-settings-field">
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={4}
              maxLength={2000}
              placeholder="Tell people what this form is about."
            />
          </div>
          <div className="form-settings-group">
            <p className="form-settings-group-title">Form experience</p>
            <div className="form-settings-field">
              <Label htmlFor="form-presentation">Presentation</Label>
              <Select
                value={settings.presentation.mode}
                onValueChange={(mode) =>
                  updateSettings({
                    presentation: {
                      mode: mode === "slideshow" ? "slideshow" : "form",
                    },
                  })
                }
              >
                <SelectTrigger id="form-presentation" className="form-settings-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form">All questions on one page</SelectItem>
                  <SelectItem value="slideshow">One question at a time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="form-settings-group">
            <p className="form-settings-group-title">Respondents</p>
            <div className="form-settings-field">
              <Label htmlFor="respondent-login">Sign-in access</Label>
              <Select
                value={settings.respondentAccess.login}
                disabled={
                  settings.respondentAccess.oneResponsePerAccount
                }
                onValueChange={(login) =>
                  updateSettings({
                    respondentAccess: {
                      login:
                        login === "required" || login === "optional"
                          ? login
                          : "none",
                    },
                  })
                }
              >
                <SelectTrigger id="respondent-login" className="form-settings-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Require login</SelectItem>
                  <SelectItem value="optional">Login optional</SelectItem>
                  <SelectItem value="none">No login</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Label htmlFor="one-response-per-account" className="form-settings-toggle">
              <Switch
                id="one-response-per-account"
                checked={settings.respondentAccess.oneResponsePerAccount}
                onCheckedChange={(checked) =>
                  updateSettings({
                    respondentAccess: {
                      oneResponsePerAccount: checked,
                      ...(checked ? { login: "required" } : {}),
                    },
                  })
                }
              />
              One response per account
            </Label>
            <p className="form-settings-help">
              {settings.respondentAccess.oneResponsePerAccount
                ? "Login is required for this setting. Submission rules are not enforced by a public response flow yet."
                : "These access settings are saved for the public response flow, which is not available yet."}
            </p>
            <Label htmlFor="accepting-responses" className="form-settings-toggle">
              <Switch
                id="accepting-responses"
                checked={acceptingResponses}
                onCheckedChange={setAcceptingResponses}
              />
              Accepting responses
            </Label>
          </div>
          <div className="form-settings-status">
            <span>Status</span>
            <strong>{form.status === "published" ? "Active" : "Draft"}</strong>
            <p>
              {form.status === "draft"
                ? "Only you can see this draft. Publish when it is ready."
                : acceptingResponses
                  ? "This form is published. Public submissions are not available yet."
                  : "This form is published but response collection is turned off."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
