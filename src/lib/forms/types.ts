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

export type FormSettings = {
  presentation: {
    mode: "form" | "slideshow";
  };
  respondentAccess: {
    login: "required" | "optional" | "none";
    oneResponsePerAccount: boolean;
  };
};

export type FormDefinition = {
  schemaVersion: 1;
  settings: FormSettings;
  blocks: Array<{
    id: string;
    type: "question";
    label: string;
    kind: FormFieldType;
    required: boolean;
  }>;
};

export type FormRecord = {
  id: string;
  owner_id?: string | null;
  title: string;
  description: string | null;
  slug?: string | null;
  status: FormStatus;
  draft_definition?: FormDefinition | null;
  published_version_id?: string | null;
  accepting_responses?: boolean | null;
  fields: FormField[];
  created_at: string;
  updated_at: string;
};
