import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * OpenAI Realtime API slot.
 *
 * Flow: the browser calls POST /api/realtime/session, this route exchanges the
 * server-side OPENAI_API_KEY for a short-lived ephemeral session token, and the
 * browser then opens a direct WebSocket to the Realtime endpoint with that token.
 * This keeps your real API key server-side.
 */
export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Realtime sessions need OPENAI_API_KEY in your .env file." },
      { status: 503 }
    );
  }

  const model = process.env.NEXT_PUBLIC_REALTIME_MODEL || "gpt-4o-realtime-preview";

  try {
    const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        voice: "sage",
        instructions:
          "You are Alex, a patient, encouraging English voice tutor for a Bengali-speaking student. Keep replies to 2 to 4 short spoken sentences, plain text only, one question at a time. Praise first, then gently correct grammar or pronunciation, then ask the learner to repeat the corrected sentence.",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        turn_detection: { type: "server_vad" }
      })
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Realtime session creation failed." }, { status: 502 });
    }

    const data = (await res.json()) as { client_secret?: { value?: string }; id?: string };

    return NextResponse.json({
      sessionId: data.id,
      clientSecret: data.client_secret?.value,
      model,
      websocketUrl: `wss://api.openai.com/v1/realtime?model=${model}`
    });
  } catch (err) {
    console.error("Realtime session error", err);
    return NextResponse.json({ error: "Could not reach Realtime API." }, { status: 502 });
  }
}
