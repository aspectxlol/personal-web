import { describe, expect, it } from "vitest";
import {
  buildDraftDefinition,
  defaultFormSettings,
  parseDraftDefinition,
  parseFormBlockList,
  parseFormFieldList,
  parseFormResponseAnswers,
  parseFormSettings,
  parseFormSettingsInput,
  parsePublishedFormDefinition,
  toFormRecord,
} from "../../src/lib/forms/validation";
import type { FormBlock } from "../../src/lib/forms/types";

const question = (
  overrides: Partial<Extract<FormBlock, { type: "question" }>> = {},
): Extract<FormBlock, { type: "question" }> => ({
  id: "question-1",
  type: "question",
  label: "Your name",
  kind: "short_text",
  required: true,
  ...overrides,
});

describe("form definition validation", () => {
  it("normalizes valid block input while preserving block order", () => {
    expect(
      parseFormBlockList([
        {
          id: "section-1",
          type: "section",
          title: "  About you  ",
          description: "  Tell us about yourself.  ",
        },
        {
          id: "question-1",
          type: "question",
          label: "  Your name  ",
          kind: "short_text",
          required: true,
        },
      ]),
    ).toEqual([
      {
        id: "section-1",
        type: "section",
        title: "About you",
        description: "Tell us about yourself.",
      },
      question(),
    ]);
  });

  it("rejects malformed or unsafe block input", () => {
    expect(
      parseFormBlockList([question(), { ...question(), id: "question-1" }]),
    ).toBeNull();
    expect(parseFormBlockList([{ ...question(), label: "   " }])).toBeNull();
    expect(parseFormBlockList([{ ...question(), kind: "unknown" }])).toBeNull();
    expect(
      parseFormBlockList([
        {
          id: "section-1",
          type: "section",
          title: "Introduction",
          description: "x".repeat(2001),
        },
      ]),
    ).toBeNull();
  });

  it("rejects field lists with duplicate ids and invalid limits", () => {
    expect(
      parseFormFieldList([
        {
          id: "name",
          label: "Name",
          type: "short_text",
          required: true,
        },
        {
          id: "name",
          label: "Email",
          type: "email",
          required: false,
        },
      ]),
    ).toBeNull();
    expect(
      parseFormFieldList([
        {
          id: "name",
          label: "   ",
          type: "short_text",
          required: false,
        },
      ]),
    ).toBeNull();
  });

  it("parses legacy draft fields into question blocks", () => {
    const record = toFormRecord({
      id: "form-1",
      title: "Legacy form",
      fields: [
        {
          id: "name",
          label: "Name",
          type: "short_text",
          required: true,
        },
      ],
    });

    expect(record.blocks).toEqual([
      {
        id: "name",
        type: "question",
        label: "Name",
        kind: "short_text",
        required: true,
      },
    ]);
    expect(record.fields).toEqual([
      {
        id: "name",
        label: "Name",
        type: "short_text",
        required: true,
      },
    ]);
    expect(record.draft_definition).toBeNull();
  });
});

describe("form settings validation", () => {
  it("falls back safely when saved settings are incomplete", () => {
    expect(parseFormSettings(null)).toEqual(defaultFormSettings);
    expect(
      parseFormSettings({
        settings: {
          presentation: { mode: "slideshow" },
          respondentAccess: {
            login: "optional",
            oneResponsePerAccount: true,
          },
        },
      }),
    ).toEqual({
      presentation: { mode: "slideshow" },
      respondentAccess: { login: "required", oneResponsePerAccount: true },
    });
  });

  it("requires login when one-response-per-account is enabled", () => {
    expect(
      parseFormSettingsInput({
        presentation: { mode: "form" },
        respondentAccess: {
          login: "optional",
          oneResponsePerAccount: true,
        },
      }),
    ).toBeNull();
    expect(
      parseFormSettingsInput({
        presentation: { mode: "slideshow" },
        respondentAccess: {
          login: "required",
          oneResponsePerAccount: true,
        },
      }),
    ).toEqual({
      presentation: { mode: "slideshow" },
      respondentAccess: { login: "required", oneResponsePerAccount: true },
    });
  });
});

describe("form response validation", () => {
  const blocks: FormBlock[] = [
    question(),
    question({
      id: "bio",
      label: "Bio",
      kind: "long_text",
      required: false,
    }),
    question({
      id: "email",
      label: "Email",
      kind: "email",
      required: false,
    }),
    question({
      id: "consent",
      label: "Consent",
      kind: "checkbox",
      required: true,
    }),
  ];

  it("accepts and normalizes valid answers", () => {
    expect(
      parseFormResponseAnswers(blocks, {
        "question-1": " Ada ",
        bio: "A long answer",
        email: "  ada@example.com ",
        consent: true,
      }),
    ).toEqual({
      "question-1": " Ada ",
      bio: "A long answer",
      email: "ada@example.com",
      consent: true,
    });
  });

  it("rejects missing required answers and unknown question ids", () => {
    expect(
      parseFormResponseAnswers(blocks, {
        email: "ada@example.com",
        consent: true,
      }),
    ).toBeNull();
    expect(
      parseFormResponseAnswers(blocks, {
        "question-1": "Ada",
        consent: true,
        extra: "unexpected",
      }),
    ).toBeNull();
  });

  it("rejects invalid email, checkbox, null-byte, and length answers", () => {
    expect(
      parseFormResponseAnswers(blocks, {
        "question-1": "Ada",
        email: "not-an-email",
        consent: true,
      }),
    ).toBeNull();
    expect(
      parseFormResponseAnswers(blocks, {
        "question-1": "Ada",
        consent: false,
      }),
    ).toBeNull();
    expect(
      parseFormResponseAnswers(blocks, {
        "question-1": "Ada\0",
        consent: true,
      }),
    ).toBeNull();
    expect(
      parseFormResponseAnswers(blocks, {
        "question-1": "Ada",
        bio: "x".repeat(10001),
        consent: true,
      }),
    ).toBeNull();
  });
});

describe("published form definitions", () => {
  it("requires at least one valid question", () => {
    expect(
      parsePublishedFormDefinition({
        schemaVersion: 2,
        settings: defaultFormSettings,
        blocks: [
          {
            id: "section-1",
            type: "section",
            title: "Only a section",
            description: "",
          },
        ],
      }),
    ).toBeNull();
    expect(
      parsePublishedFormDefinition(buildDraftDefinition([question()])),
    ).toEqual({
      blocks: [question()],
      settings: defaultFormSettings,
    });
  });

  it("drops malformed draft blocks instead of exposing them", () => {
    expect(
      parseDraftDefinition({
        blocks: [
          question(),
          { id: "ignored", type: "unsupported" },
          {
            id: "section-1",
            type: "section",
            title: 42,
          },
        ],
      }),
    ).toEqual([
      question(),
      {
        id: "section-1",
        type: "section",
        title: "Section",
        description: "",
      },
    ]);
  });
});
