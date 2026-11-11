import {
  FORM_FIELD_TYPES,
  type FormField,
  type FormFieldType,
  type FormRecord,
} from "./types";
import type { Json } from "@/lib/supabase/database.types";

function isObject(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

export function toFormRecord(
  row: Omit<FormRecord, "fields"> & { fields: Json }
): FormRecord {
  return { ...row, fields: parseFormFields(row.fields) };
}

export function isValidCloseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
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

export function toJsonFields(fields: FormField[]): Json {
  return fields.map((field) => ({
    id: field.id,
    label: field.label,
    type: field.type,
    required: field.required,
  }));
}
