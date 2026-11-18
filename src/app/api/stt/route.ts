import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Whisper STT slot. POST multipart/form-data with field "audio" (webm/wav/mp3).
 * Pair this with the MicButton by recording via MediaRecorder and replacing the
 * browser SpeechRecognition loop for high-accuracy transcription.
 */
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Whisper transcription needs OPENAI_API_KEY in your .env file." },
      { status: 503 }
    );
  }

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: 'Missing "audio" file field.' }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.append("file", audio, audio.name || "speech.webm");
  upstream.append("model", process.env.OPENAI_STT_MODEL || "whisper-1");
  upstream.append("language", "en");

  try {
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Transcription service failed." }, { status: 502 });
    }

    const data = (await res.json()) as { text?: string };
    return NextResponse.json({ text: data.text ?? "" });
  } catch (err) {
    console.error("STT route error", err);
    return NextResponse.json({ error: "Could not reach transcription service." }, { status: 502 });
  }
}
