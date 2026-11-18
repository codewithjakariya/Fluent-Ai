import { NextResponse } from "next/server";
import { buildSystemPrompt, DEMO_FALLBACK_LINES, type LessonStage } from "@/lib/prompt";
import { resolveProvider } from "@/lib/aiProvider";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface TutorRequestBody {
  messages: ChatTurn[];
  unit: {
    id: number;
    lessonId?: number;
    stage?: LessonStage;
    completed?: boolean;
    askingForHelp?: boolean;
    learnerName?: string;
  };
}

const OFFLINE_RESPONSES: string[] = [
  "Hello, I am Alex, your English tutor, and I am really happy to practice with you. Right now my AI brain is offline because no GROQ_API_KEY is set in the .env file, but we can still do a quick practice round. Tell me, which sentence would you like to try saying in English today?",
  "Good effort! I can hear you clearly. Remember, I would normally correct your grammar very gently here, and you would repeat the sentence after me. Since my AI connection is missing, try repeating: I am practicing English every day. Can you say that nicely for me?",
  "You are doing nicely, and I like your confidence. In the full version of this app I would now ask one short quiz question about today's unit. Would you like to try one practice question anyway?"
];

export async function POST(request: Request) {
  let body: TutorRequestBody;
  try {
    body = (await request.json()) as TutorRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const unit = body?.unit;

  const provider = resolveProvider();

  if (!provider) {
    const index = messages.filter((m) => m?.role === "user").length;
    const fallback =
      unit?.askingForHelp
        ? DEMO_FALLBACK_LINES.help
        : messages.length === 0
        ? DEMO_FALLBACK_LINES.greet
        : OFFLINE_RESPONSES[Math.min(Math.max(index - 1, 0), OFFLINE_RESPONSES.length - 1)];
    return NextResponse.json({ reply: fallback, mode: "demo" });
  }

  const systemPrompt = buildSystemPrompt({
    unitId: unit?.id ?? 1,
    lessonId: unit?.lessonId,
    stage: unit?.stage,
    completed: unit?.completed,
    askingForHelp: unit?.askingForHelp,
    learnerName: unit?.learnerName
  });

  const recent = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  try {
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: provider.chatModel,
        messages: [{ role: "system", content: systemPrompt }, ...recent],
        temperature: 0.7,
        max_tokens: 220
      })
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Chat completion error", provider.provider, res.status, detail.slice(0, 500));
      return NextResponse.json(
        {
          error:
            provider.provider === "groq"
              ? "Groq request failed. Check your GROQ_API_KEY or model name in .env."
              : "AI service failed. Please check your OPENAI_API_KEY.",
          mode: "error"
        },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const reply =
      data.choices?.[0]?.message?.content?.trim() ?? "Sorry, I did not catch that. Could you say it again?";

    const plain = reply
      .replace(/[*_#`>|]/g, "")
      .replace(/^\s*\d+[.)]\s*/gm, "")
      .trim();

    return NextResponse.json({ reply: plain, mode: "live" });
  } catch (err) {
    console.error("Tutor route error", err);
    return NextResponse.json(
      { error: "Could not reach the AI tutor service.", mode: "error" },
      { status: 502 }
    );
  }
}
