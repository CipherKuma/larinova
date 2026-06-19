import { NextResponse } from "next/server";
import { lookupKki } from "@/lib/integrations/kki";

export async function POST(req: Request) {
  try {
    const { registrationNumber } = await req.json();
    const result = await lookupKki(registrationNumber);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[kki/lookup] failed:", err);
    return NextResponse.json({ error: "KKI lookup failed" }, { status: 400 });
  }
}
