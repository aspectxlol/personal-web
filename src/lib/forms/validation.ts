import {
  FORM_FIELD_TYPES,
  type FormBlock,
  type FormDefinition,
  type FormField,
  type FormFieldType,
  type FormQuestionBlock,
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
  schemaVersion: 2,
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

export function parseDraftDefinition(value: Json | null | undefined): FormBlock[] {
  if (!value || !isObject(value)) return [];

  const blocks = Array.isArray(value.blocks) ? value.blocks : [];
  return blocks.flatMap((block): FormBlock[] => {
    if (!isObject(block)) return [];

    const id = typeof block.id === "string" ? block.id : crypto.randomUUID();
    if (block.type === "section") {
      return [{
        id,
        type: "section" as const,
        title: typeof block.title === "string" ? block.title : "Section",
        description:
          typeof block.description === "string" ? block.description : "",
      }];
    }

    if (block.type !== "question") return [];

    const label = typeof block.label === "string" ? block.label : "Question";
    const kind =
      typeof block.kind === "string" &&
      FORM_FIELD_TYPES.includes(block.kind as FormFieldType)
        ? (block.kind as FormFieldType)
        : "short_text";
    const required =
      typeof block.required === "boolean" ? block.required : false;

    return [{ id, type: "question" as const, label, kind, required }];
  });
}

export function buildDraftDefinition(
  blocks: FormBlock[],
  settings: FormSettings = defaultFormSettings,
): FormDefinition {
  return {
    ...defaultFormDefinition,
    settings,
    blocks,
  };
}

export function getQuestionFields(blocks: FormBlock[]): FormField[] {
  return blocks.flatMap((block) =>
    block.type === "question"
      ? [{
          id: block.id,
          label: block.label,
          type: block.kind,
          required: block.required,
        }]
      : [],
  );
}

export function questionBlocksFromFields(fields: FormField[]): FormQuestionBlock[] {
  return fields.map((field) => ({
    id: field.id,
    type: "question",
    label: field.label,
    kind: field.type,
    required: field.required,
  }));
}

type FormRecordRow = Partial<Omit<FormRecord, "blocks" | "fields" | "draft_definition">> & {
  fields?: Json;
  draft_definition?: Json | null;
};

export function toFormRecord(row: FormRecordRow): FormRecord {
  const blocks =
    row.draft_definition !== null && row.draft_definition !== undefined
      ? parseDraftDefinition(row.draft_definition)
      : Array.isArray(row.fields)
        ? questionBlocksFromFields(parseFormFields(row.fields))
        : [];
  const fields = getQuestionFields(blocks);
  const draftDefinition =
    row.draft_definition !== null && row.draft_definition !== undefined
      ? buildDraftDefinition(blocks, parseFormSettings(row.draft_definition))
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
    blocks,
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

export function parseFormBlockList(value: unknown): FormBlock[] | null {
  if (!Array.isArray(value) || value.length > 200) return null;

  const blocks: FormBlock[] = [];
  const ids = new Set<string>();
  let questionCount = 0;

  for (const entry of value) {
    if (!isRecord(entry)) return null;
    if (
      typeof entry.id !== "string" ||
      entry.id.length < 1 ||
      entry.id.length > 80 ||
      ids.has(entry.id)
    ) {
      return null;
    }

    if (entry.type === "question") {
      questionCount += 1;
      if (
        questionCount > 100 ||
        typeof entry.label !== "string" ||
        entry.label.trim().length < 1 ||
        entry.label.length > 120 ||
        typeof entry.kind !== "string" ||
        !FORM_FIELD_TYPES.includes(entry.kind as FormFieldType) ||
        typeof entry.required !== "boolean"
      ) {
        return null;
      }

      blocks.push({
        id: entry.id,
        type: "question",
        label: entry.label.trim(),
        kind: entry.kind as FormFieldType,
        required: entry.required,
      });
    } else if (entry.type === "section") {
      if (
        typeof entry.title !== "string" ||
        entry.title.trim().length < 1 ||
        entry.title.length > 120 ||
        (entry.description !== undefined &&
          (typeof entry.description !== "string" ||
            entry.description.length > 2000))
      ) {
        return null;
      }

      blocks.push({
        id: entry.id,
        type: "section",
        title: entry.title.trim(),
        description:
          typeof entry.description === "string"
            ? entry.description.trim()
            : "",
      });
    } else {
      return null;
    }

    ids.add(entry.id);
  }

  return blocks;
}

export function parseFormResponseAnswers(
  blocks: FormBlock[],
  value: unknown,
): Record<string, string | boolean> | null {
  if (!isRecord(value)) return null;

  const questions = new Map(
    blocks.flatMap((block) =>
      block.type === "question" ? [[block.id, block] as const] : [],
    ),
  );
  const normalized: [string, string | boolean][] = [];

  for (const [id, answer] of Object.entries(value)) {
    const question = questions.get(id);
    if (!question) return null;

    if (question.kind === "checkbox") {
      if (typeof answer !== "boolean" || (question.required && !answer)) {
        return null;
      }
      normalized.push([id, answer]);
      continue;
    }

    if (typeof answer !== "string" || answer.includes("\0")) return null;
    const maxLength =
      question.kind === "long_text"
        ? 10000
        : question.kind === "email"
          ? 254
          : 1000;
    if (
      answer.length > maxLength ||
      (question.required && !answer.trim())
    ) {
      return null;
    }

    if (question.kind === "email") {
      const email = answer.trim();
      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return null;
      }
      normalized.push([id, email]);
    } else {
      normalized.push([id, answer]);
    }
  }

  for (const question of questions.values()) {
    if (question.required && !Object.hasOwn(value, question.id)) {
      return null;
    }
  }

  return Object.fromEntries(normalized);
}

export function parsePublishedFormDefinition(
  value: Json,
): { blocks: FormBlock[]; settings: FormSettings } | null {
  if (!isObject(value)) return null;
  const blocks = parseFormBlockList(value.blocks);
  if (!blocks || !blocks.some((block) => block.type === "question")) {
    return null;
  }

  return { blocks, settings: parseFormSettings(value) };
}
