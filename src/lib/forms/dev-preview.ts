import { buildDraftDefinition, getQuestionFields } from "./validation";
import type { FormBlock, FormRecord } from "./types";

const blocks: FormBlock[] = [
  {
    id: "dev-section-about",
    type: "section",
    title: "About you",
    description: "A sample section with **Markdown** for testing the layout.",
  },
  {
    id: "dev-question-name",
    type: "question",
    label: "What should we call you?",
    kind: "short_text",
    required: true,
  },
  {
    id: "dev-question-feedback",
    type: "question",
    label: "What would you like to share?",
    kind: "long_text",
    required: false,
  },
  {
    id: "dev-question-email",
    type: "question",
    label: "Email address (optional)",
    kind: "email",
    required: false,
  },
  {
    id: "dev-question-consent",
    type: "question",
    label: "I agree to the **terms**",
    kind: "checkbox",
    required: true,
  },
];

export const devPreviewForm: FormRecord = {
  id: "dev-preview",
  title: "Development **preview** form",
  description: "Sample content for checking the dashboard and editor. **Markdown** renders on the response form.",
  slug: "dev-preview",
  status: "published",
  draft_definition: buildDraftDefinition(blocks),
  blocks,
  fields: getQuestionFields(blocks),
  accepting_responses: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};
