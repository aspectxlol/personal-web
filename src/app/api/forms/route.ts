import { NextResponse } from "next/server";
import { requireAdminContext } from "@/lib/supabase/admin";
import { toFormRecord } from "@/lib/forms/validation";

export async function GET() {
  const admin = await requireAdminContext();
  if (!admin.ok) return admin.response;

  const { data, error } = await admin.supabase
    .from("forms")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load forms." }, { status: 500 });
  }

  try {
    return NextResponse.json(
      { forms: data.map(toFormRecord) },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Saved form data is invalid. Review the forms table data." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminContext();
  if (!admin.ok) return admin.response;

  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid form details." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const title =
    typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";

  if (!title || title.length > 120 || description.length > 2000) {
    return NextResponse.json(
      { error: "Add a form name (up to 120 characters) and keep the description under 2,000 characters." },
      { status: 400 }
    );
  }

  const { data, error } = await admin.supabase
    .from("forms")
    .insert({
      user_id: admin.user.id,
      title,
      description,
      status: "draft",
      fields: [],
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create the draft form." }, { status: 500 });
  }

  try {
    return NextResponse.json({ form: toFormRecord(data) }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "The created form could not be read. Review the forms table data." },
      { status: 500 }
    );
  }
}
