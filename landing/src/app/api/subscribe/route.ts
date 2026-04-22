import { NextRequest, NextResponse } from "next/server";
import { validateLead, forwardLead, type LeadPayload } from "@/lib/leads";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: Partial<LeadPayload> = {};
  try {
    body = (await req.json()) as Partial<LeadPayload>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const v = validateLead("subscribe", body);
  if (!v.ok) {
    return NextResponse.json({ ok: false, errors: v.errors }, { status: 422 });
  }

  const payload: LeadPayload = {
    kind: "subscribe",
    email: (body.email || "").trim(),
    source: body.source || "footer",
    receivedAt: new Date().toISOString(),
    ip: req.headers.get("x-forwarded-for"),
    userAgent: req.headers.get("user-agent"),
  };

  await forwardLead(payload);
  return NextResponse.json({ ok: true });
}
