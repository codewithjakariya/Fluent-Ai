import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body?.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Translation needs OPENAI_API_KEY in your .env file." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              "You are a precise English to Bengali translator. Translate the user's text into natural, everyday Bengali script. Reply with ONLY the Bengali translation, no explanations, no quotes."
          },
          { role: "user", content: text }
        ]
      })
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Translation service failed." }, { status: 502 });
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const bengali = data.choices?.[0]?.message?.content?.trim();
    if (!bengali) {
      return NextResponse.json({ error: "Empty translation." }, { status: 502 });
    }

    return NextResponse.json({ bengali });
  } catch (err) {
    console.error("Translate route error", err);
    return NextResponse.json({ error: "Could not reach translation service." }, { status: 502 });
  }
}
