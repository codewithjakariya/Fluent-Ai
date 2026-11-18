/**
 * AI provider resolution.
 *
 * Default: Groq (free API key from https://console.groq.com/keys — no card needed).
 * Groq exposes an OpenAI-compatible REST API, so one client covers both.
 * If GROQ_API_KEY is absent, it falls back to OPENAI_API_KEY if present.
 */

export interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  chatModel: string;
  sttModel: string;
  provider: "groq" | "openai";
}

export function resolveProvider(): ProviderConfig | null {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return {
      provider: "groq",
      baseUrl: "https://api.groq.com/openai/v1",
      apiKey: groqKey,
      chatModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      sttModel: process.env.GROQ_STT_MODEL || "whisper-large-v3-turbo"
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: openaiKey,
      chatModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
      sttModel: process.env.OPENAI_STT_MODEL || "whisper-1"
    };
  }

  return null;
}
