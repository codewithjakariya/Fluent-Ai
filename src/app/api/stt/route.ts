import { NextResponse } from "next/server";
import { resolveProvider } from "@/lib/aiProvider";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Whisper STT slot (Groq free tier or OpenAI). POST multipart/form-data with
 * field "audio" (webm/wav/mp3). Pair this with the MicButton by recording via
 * MediaRecorder and replacing the browser SpeechRecognition loop for
 * high-accuracy transcription.
 */
export async function POST(request: Request) {
  const provider = resolveProvider();
  if (!provider) {
    return NextResponse.json(
      { error: "Transcription needs GROQ_API_KEY (free) or OPENAI_API_KEY in your .env file." },
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
  upstream.append("model", provider.sttModel);
  upstream.append("language", "en");

  try {
    const res = await fetch(`${provider.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${provider.apiKey}` },
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
