import { NextResponse } from "next/server";
import {
  isValidCloseDate,
  parseFormFieldList,
  parseFormFields,
  toFormRecord,
  toJsonFields,
} from "@/lib/forms/validation";
import type { FormField } from "@/lib/forms/types";
import type { Database } from "@/lib/supabase/database.types";
import { requireAdminContext } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

function isUuid(value: string) {
  return /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const admin = await requireAdminContext();
  if (!admin.ok) return admin.response;
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  const { data, error } = await admin.supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not load this form." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  try {
    return NextResponse.json(
      { form: toFormRecord(data) },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Saved form data is invalid. Review this form's fields." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const admin = await requireAdminContext();
  if (!admin.ok) return admin.response;
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }
  const body: unknown = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid form update." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const updates: Database["public"]["Tables"]["forms"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  let submittedFields: FormField[] | null = null;
  let hasUpdate = false;

  if ("title" in input) {
    if (typeof input.title !== "string" || !input.title.trim() || input.title.trim().length > 120) {
      return NextResponse.json({ error: "Form name must be between 1 and 120 characters." }, { status: 400 });
    }
    updates.title = input.title.trim();
    hasUpdate = true;
  }

  if ("description" in input) {
    if (typeof input.description !== "string" || input.description.length > 2000) {
      return NextResponse.json({ error: "Description must be 2,000 characters or fewer." }, { status: 400 });
    }
    updates.description = input.description.trim();
    hasUpdate = true;
  }

  if ("close_date" in input) {
    if (
      input.close_date !== null &&
      (typeof input.close_date !== "string" || !isValidCloseDate(input.close_date))
    ) {
      return NextResponse.json({ error: "Choose a valid closing date." }, { status: 400 });
    }
    updates.close_date = input.close_date;
    hasUpdate = true;
  }

  if ("fields" in input) {
    const fields = parseFormFieldList(input.fields);
    if (!fields) {
      return NextResponse.json({ error: "One or more form fields are invalid." }, { status: 400 });
    }
    submittedFields = fields;
    updates.fields = toJsonFields(fields);
    hasUpdate = true;
  }

  if ("status" in input) {
    if (input.status !== "draft" && input.status !== "published") {
      return NextResponse.json({ error: "Invalid form status." }, { status: 400 });
    }
    updates.status = input.status;
    updates.published_at =
      input.status === "published" ? new Date().toISOString() : null;
    hasUpdate = true;

    if (input.status === "published") {
      let fields = submittedFields;
      if (!fields) {
        const { data, error } = await admin.supabase
          .from("forms")
          .select("fields")
          .eq("id", id)
          .maybeSingle();
        if (error) {
          return NextResponse.json({ error: "Could not verify this form's questions." }, { status: 500 });
        }
        if (!data) {
          return NextResponse.json({ error: "Form not found." }, { status: 404 });
        }
        try {
          fields = parseFormFields(data.fields);
        } catch {
          return NextResponse.json(
            { error: "Saved form data is invalid. Review this form's fields." },
            { status: 500 }
          );
        }
      }

      if (fields.length === 0) {
        return NextResponse.json(
          { error: "Add at least one question before publishing this form." },
          { status: 400 }
        );
      }
    }
  }

  if (!hasUpdate) {
    return NextResponse.json({ error: "No form changes were provided." }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("forms")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not save this form." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  try {
    return NextResponse.json({ form: toFormRecord(data) });
  } catch {
    return NextResponse.json(
      { error: "The saved form could not be read. Review this form's fields." },
      { status: 500 }
    );
  }
}
