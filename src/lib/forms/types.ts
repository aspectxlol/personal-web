export const FORM_FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "checkbox",
] as const;

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];
export type FormStatus = "draft" | "published";

export type FormField = {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
};

export type FormRecord = {
  id: string;
  title: string;
  description: string;
  status: FormStatus;
  close_date: string | null;
  fields: FormField[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
};
