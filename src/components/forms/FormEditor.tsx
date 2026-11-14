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
          className="inline-flex whitespace-nowrap"
        >
          <span aria-hidden="true">+</span>
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-55">
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
    <div className="mx-auto w-full max-w-330">
      <header className="flex items-end justify-between gap-6 border-b border-(--line) pb-5.75 max-[560px]:items-stretch max-[560px]:flex-col">
        <div>
          <Link href="/dashboard/forms" className="mb-4 inline-flex items-center gap-1.75 text-[.75rem] text-ink-soft hover:text-accent-dark">
            <span aria-hidden="true">←</span> Forms
          </Link>
          <div className="mb-2.25 flex flex-wrap items-center gap-3">
            <Input
              aria-label="Form name"
              className="h-auto min-h-[1.15em] w-[min(55vw,520px)] min-w-55 border-0 border-b border-transparent bg-transparent p-0 font-sans text-[clamp(1.7rem,4vw,2.8rem)] leading-[1.15] font-bold tracking-[-.07em] text-ink focus-visible:border-(--accent) focus-visible:ring-0 max-[560px]:w-full"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              maxLength={120}
            />
            <Badge variant={form.status === "published" ? "default" : "secondary"} className={`inline-flex h-auto items-center gap-1.75 rounded-none border-0 bg-transparent px-1.5 py-0.75 font-mono text-[.62rem] tracking-[.06em] uppercase ${form.status === "published" ? "text-[#26734d]" : "text-ink-soft"}`}>
              <span className={`size-1.75 rounded-full ${form.status === "published" ? "bg-[#26734d]" : "bg-[#bd7b22]"}`} aria-hidden="true" />
              {form.status}
            </Badge>
          </div>
          <p className="m-0 max-w-[58ch] text-[.92rem] leading-[1.55] text-ink-soft">
            Edit questions and settings. Changes stay private until you publish.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 max-[560px]:justify-start">
          {notice && <span className="text-[.74rem] text-[#26734d]" role="status">{notice}</span>}
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
        <p className="mt-3.5 mb-[-7px] text-[.78rem] text-ink-soft">
          Add at least one question before publishing.
        </p>
      )}

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 border border-[color-mix(in_srgb,var(--accent)_40%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--paper))] px-3.75 py-3.25 text-[.84rem] leading-[1.5] text-accent-dark" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-5 pt-5.5 max-[1100px]:grid-cols-[minmax(0,1fr)_270px] max-[800px]:grid-cols-1">
        <section className="min-w-0 border border-(--line) bg-[color-mix(in_srgb,var(--paper-deep)_44%,var(--paper))] p-5 max-[560px]:p-3.5" aria-labelledby="questions-heading">
          <div className="mb-5 flex items-center justify-between gap-4.5 max-[560px]:items-start max-[560px]:flex-col">
            <div>
              <p className="mb-0 font-mono text-[.65rem] font-semibold tracking-[.11em] text-ink-soft uppercase">Form builder</p>
              <h2 className="mt-1.5 mb-0 text-[1.2rem] tracking-[-.05em]" id="questions-heading">Questions</h2>
            </div>
            <QuestionTypeMenu label="Add question" onSelect={addField} />
          </div>

          {form.fields.length > 0 ? (
            <div className="grid gap-3">
              {form.fields.map((field, index) => (
                <Card
                  className={`grid grid-cols-[48px_minmax(0,1fr)] gap-3 border border-(--line) bg-(--paper) p-3.75 transition-[border-color,opacity] duration-150 ${draggedFieldId === field.id ? "border-(--accent) opacity-45" : ""}`}
                  key={field.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleFieldDrop(event, field.id)}
                >
                  <div className="flex flex-col items-center gap-1.25">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="h-auto cursor-grab border-0 bg-transparent px-1.25 py-0.5 text-base leading-none text-ink-soft hover:bg-transparent active:cursor-grabbing"
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
                    <span className="font-mono text-[.64rem] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="grid">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="h-5.5 w-6 border-0 bg-transparent text-ink-soft hover:bg-transparent hover:text-accent-dark disabled:cursor-not-allowed disabled:opacity-35"
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
                        className="h-5.5 w-6 border-0 bg-transparent text-ink-soft hover:bg-transparent hover:text-accent-dark disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label={`Move ${field.label} down`}
                        disabled={index === form.fields.length - 1}
                        onClick={() => moveField(field.id, 1)}
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-3 font-mono text-[.62rem] tracking-[.05em] text-ink-soft uppercase">
                      <span>{fieldLabels[field.type]}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto border-0 border-b border-transparent bg-transparent px-0 py-1 text-[.68rem] text-ink-soft normal-case hover:border-(--accent-dark) hover:bg-transparent hover:text-accent-dark"
                        onClick={() => removeField(field.id)}
                        aria-label={`Remove ${field.label}`}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-1.75 text-ink-soft">
                      <Label className="font-mono text-[.68rem] font-semibold tracking-[.05em] text-ink-soft uppercase" htmlFor={`question-${field.id}`}>Question label</Label>
                      <Input
                        className="h-auto min-h-9.5 w-full rounded-[2px] border border-(--line) bg-(--paper) px-3 py-2.5 font-sans text-[.88rem] text-ink"
                        id={`question-${field.id}`}
                        value={field.label}
                        onChange={(event) =>
                          updateField(field.id, { label: event.target.value })
                        }
                        maxLength={120}
                      />
                    </div>
                    <div>
                      {field.type === "checkbox" ? (
                        <div className="flex items-center gap-2 text-[.82rem] text-ink-soft">
                          <Checkbox disabled aria-hidden="true" />
                          {field.label || "Checkbox option"}
                        </div>
                      ) : field.type === "long_text" ? (
                        <Textarea disabled className="min-h-22 w-full resize-y border border-(--line) bg-(--paper-deep) px-3 py-2.5 font-sans text-[.82rem] text-ink-soft" placeholder="Long answer" rows={3} />
                      ) : (
                        <Input
                          disabled
                          className="h-auto min-h-10.5 w-full rounded-[2px] border border-(--line) bg-(--paper-deep) px-3 py-2.5 font-sans text-[.82rem] text-ink-soft"
                          type={field.type === "email" ? "email" : "text"}
                          placeholder={field.type === "email" ? "name@example.com" : "Short answer"}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[.75rem] text-ink-soft">
                      <Checkbox
                        className="size-4 shrink-0"
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
            <div className="flex min-h-62.5 flex-col items-center justify-center border border-dashed border-(--line) p-6 text-center">
              <span className="mb-3.75 grid size-11 place-items-center border border-(--line) bg-(--paper-deep) text-[1.3rem] text-accent" aria-hidden="true">＋</span>
              <h3 className="mb-2 text-[1.1rem] tracking-[-.04em]">Start with a question</h3>
              <p className="mb-4.5 text-[.83rem] text-ink-soft">Add a question to begin building your form.</p>
              <QuestionTypeMenu
                label="Add your first question"
                variant="primary"
                onSelect={addField}
              />
            </div>
          )}
        </section>

        <aside className="row-span-1 grid min-w-0 gap-4.75 border border-(--line) bg-[color-mix(in_srgb,var(--paper-deep)_44%,var(--paper))] p-4.5 max-[800px]:row-start-1" aria-labelledby="settings-heading">
          <div className="border-b border-(--line) pb-3.5">
            <p className="mb-0 font-mono text-[.65rem] font-semibold tracking-[.11em] text-ink-soft uppercase">Configuration</p>
            <h2 className="mt-1.5 mb-0 text-[1.2rem] tracking-[-.05em]" id="settings-heading">Form settings</h2>
          </div>
          <div className="grid gap-1.75 text-ink-soft">
            <Label className="font-mono text-[.68rem] font-semibold tracking-[.05em] text-ink-soft uppercase" htmlFor="form-description">Description</Label>
            <Textarea
              className="min-h-22 w-full resize-y rounded-[2px] border border-(--line) bg-(--paper) px-3 py-2.5 font-sans text-[.88rem] text-ink"
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
          <div className="grid gap-3.25">
            <p className="mb-0 border-b border-(--line) pb-2 font-mono text-[.62rem] tracking-[.07em] text-ink-soft uppercase">Form experience</p>
            <div className="grid gap-1.75 text-ink-soft">
              <Label className="font-mono text-[.68rem] font-semibold tracking-[.05em] text-ink-soft uppercase" htmlFor="form-presentation">Presentation</Label>
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
                <SelectTrigger id="form-presentation" className="h-auto min-h-10.5 w-full rounded-[2px] border border-(--line) bg-(--paper) px-3 py-2.5 font-sans text-[.88rem] text-ink">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form">All questions on one page</SelectItem>
                  <SelectItem value="slideshow">One question at a time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3.25">
            <p className="mb-0 border-b border-(--line) pb-2 font-mono text-[.62rem] tracking-[.07em] text-ink-soft uppercase">Respondents</p>
            <div className="grid gap-1.75 text-ink-soft">
              <Label className="font-mono text-[.68rem] font-semibold tracking-[.05em] text-ink-soft uppercase" htmlFor="respondent-login">Sign-in access</Label>
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
                <SelectTrigger id="respondent-login" className="h-auto min-h-10.5 w-full rounded-[2px] border border-(--line) bg-(--paper) px-3 py-2.5 font-sans text-[.88rem] text-ink">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Require login</SelectItem>
                  <SelectItem value="optional">Login optional</SelectItem>
                  <SelectItem value="none">No login</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Label htmlFor="one-response-per-account" className="!flex !items-start !gap-2.25 !font-sans !text-[.78rem] !normal-case !tracking-normal !text-ink">
              <Switch
                className="mt-px"
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
            <p className="mt-[-7px] mb-0 text-[.71rem] leading-[1.45] text-ink-soft">
              {settings.respondentAccess.oneResponsePerAccount
                ? "Login is required for this setting. Submission rules are not enforced by a public response flow yet."
                : "These access settings are saved for the public response flow, which is not available yet."}
            </p>
            <Label htmlFor="accepting-responses" className="!flex !items-start !gap-2.25 !font-sans !text-[.78rem] !normal-case !tracking-normal !text-ink">
              <Switch
                className="mt-px disabled:cursor-not-allowed"
                id="accepting-responses"
                checked={acceptingResponses}
                onCheckedChange={setAcceptingResponses}
              />
              Accepting responses
            </Label>
          </div>
          <div className="border-t border-(--line) pt-3.5">
            <span className="mb-1.75 block font-mono text-[.62rem] text-ink-soft uppercase">Status</span>
            <strong className="text-[.88rem]">{form.status === "published" ? "Active" : "Draft"}</strong>
            <p className="mt-1.75 mb-0 text-[.74rem] leading-[1.5] text-ink-soft">
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
