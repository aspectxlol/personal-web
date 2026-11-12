import {
  FORM_FIELD_TYPES,
  type FormDefinition,
  type FormField,
  type FormFieldType,
  type FormRecord,
  type FormSettings,
} from "./types";
import type { Json } from "@/lib/supabase/database.types";

function isObject(
  value: Json | null | undefined,
): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const defaultFormSettings: FormSettings = {
  presentation: { mode: "form" },
  respondentAccess: {
    login: "none",
    oneResponsePerAccount: false,
  },
};

export const defaultFormDefinition: FormDefinition = {
  schemaVersion: 1,
  settings: defaultFormSettings,
  blocks: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseFormSettings(value: Json | null | undefined): FormSettings {
  if (!value || !isObject(value) || !isObject(value.settings)) {
    return defaultFormSettings;
  }

  const raw = value.settings;
  const presentation = isObject(raw.presentation) ? raw.presentation : {};
  const respondentAccess = isObject(raw.respondentAccess)
    ? raw.respondentAccess
    : {};
  const oneResponsePerAccount =
    respondentAccess.oneResponsePerAccount === true;
  const requestedLogin =
    respondentAccess.login === "required" ||
    respondentAccess.login === "optional" ||
    respondentAccess.login === "none"
      ? respondentAccess.login
      : defaultFormSettings.respondentAccess.login;

  return {
    presentation: {
      mode: presentation.mode === "slideshow" ? "slideshow" : "form",
    },
    respondentAccess: {
      login: oneResponsePerAccount ? "required" : requestedLogin,
      oneResponsePerAccount,
    },
  };
}

export function parseFormSettingsInput(value: unknown): FormSettings | null {
  if (!isRecord(value)) return null;
  const presentation = value.presentation;
  const respondentAccess = value.respondentAccess;
  if (
    !isRecord(presentation) ||
    (presentation.mode !== "form" && presentation.mode !== "slideshow") ||
    !isRecord(respondentAccess) ||
    (respondentAccess.login !== "required" &&
      respondentAccess.login !== "optional" &&
      respondentAccess.login !== "none") ||
    typeof respondentAccess.oneResponsePerAccount !== "boolean"
  ) {
    return null;
  }

  if (
    respondentAccess.oneResponsePerAccount &&
    respondentAccess.login !== "required"
  ) {
    return null;
  }

  return {
    presentation: { mode: presentation.mode },
    respondentAccess: {
      login: respondentAccess.login,
      oneResponsePerAccount: respondentAccess.oneResponsePerAccount,
    },
  };
}

export function parseFormFields(value: Json): FormField[] {
  if (!Array.isArray(value)) {
    throw new Error("Saved form fields are not a list.");
  }

  return value.map((entry) => {
    if (
      !isObject(entry) ||
      typeof entry.id !== "string" ||
      typeof entry.label !== "string" ||
      typeof entry.type !== "string" ||
      !FORM_FIELD_TYPES.includes(entry.type as FormFieldType) ||
      typeof entry.required !== "boolean"
    ) {
      throw new Error("A saved form field has an invalid shape.");
    }

    return {
      id: entry.id,
      label: entry.label,
      type: entry.type as FormFieldType,
      required: entry.required,
    };
  });
}

export function parseDraftDefinition(value: Json | null | undefined): FormField[] {
  if (!value || !isObject(value)) return [];

  const blocks = Array.isArray(value.blocks) ? value.blocks : [];
  return blocks.flatMap((block) => {
    if (!isObject(block) || block.type !== "question") return [];

    const id = typeof block.id === "string" ? block.id : crypto.randomUUID();
    const label = typeof block.label === "string" ? block.label : "Question";
    const kind = typeof block.kind === "string" && FORM_FIELD_TYPES.includes(block.kind as FormFieldType)
      ? (block.kind as FormFieldType)
      : "short_text";
    const required = typeof block.required === "boolean" ? block.required : false;

    return [{ id, label, type: kind, required }];
  });
}

export function buildDraftDefinition(
  fields: FormField[],
  settings: FormSettings = defaultFormSettings,
): FormDefinition {
  return {
    ...defaultFormDefinition,
    settings,
    blocks: fields.map((field) => ({
      id: field.id,
      type: "question",
      label: field.label,
      kind: field.type,
      required: field.required,
    })),
  };
}

type FormRecordRow = Partial<Omit<FormRecord, "fields" | "draft_definition">> & {
  fields?: Json;
  draft_definition?: Json | null;
};

export function toFormRecord(row: FormRecordRow): FormRecord {
  const fields = Array.isArray(row.fields)
    ? parseFormFields(row.fields)
    : parseDraftDefinition(row.draft_definition ?? null);
  const draftDefinition = row.draft_definition
    ? buildDraftDefinition(fields, parseFormSettings(row.draft_definition))
    : null;

  return {
    id: row.id ?? "",
    owner_id: row.owner_id ?? null,
    title: row.title ?? "",
    description: row.description ?? "",
    slug: row.slug ?? null,
    status: row.status ?? "draft",
    draft_definition: draftDefinition,
    published_version_id: row.published_version_id ?? null,
    accepting_responses: row.accepting_responses ?? true,
    fields,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

export function parseFormFieldList(value: unknown): FormField[] | null {
  if (!Array.isArray(value) || value.length > 100) return null;

  const fields: FormField[] = [];
  const ids = new Set<string>();

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return null;
    }

    const field = entry as Record<string, unknown>;
    if (
      typeof field.id !== "string" ||
      field.id.length < 1 ||
      field.id.length > 80 ||
      ids.has(field.id) ||
      typeof field.label !== "string" ||
      field.label.trim().length < 1 ||
      field.label.length > 120 ||
      typeof field.type !== "string" ||
      !FORM_FIELD_TYPES.includes(field.type as FormFieldType) ||
      typeof field.required !== "boolean"
    ) {
      return null;
    }

    ids.add(field.id);
    fields.push({
      id: field.id,
      label: field.label.trim(),
      type: field.type as FormFieldType,
      required: field.required,
    });
  }

  return fields;
}
