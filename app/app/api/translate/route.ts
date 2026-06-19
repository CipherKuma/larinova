import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Use Google Translate API (free via googleapis)
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
    );

    const data = await response.json();
    const translation = data[0][0][0];
    const detectedLang = data[2];

    return NextResponse.json({
      translation,
      detectedLanguage: detectedLang,
      originalText: text,
    });
  } catch (err) {
    // Log only the error — never the source text, which may contain PHI.
    console.error("[translate] failed:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
