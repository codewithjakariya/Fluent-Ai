# FluentAI — Interactive AI Voice English Tutor (for Bengali speakers)

A full-stack Next.js app: a structured 4-phase / 20-unit curriculum sidebar, a voice tutor
("Alex") powered by the Web Speech API, a FREE AI brain via Groq (no credit card), clean
integration slots for OpenAI Realtime + ElevenLabs, bilingual English/Bengali support, and
localStorage progress tracking.

## Quick start

```bash
cp .env.example .env   # add your keys
npm install
npm run dev            # http://localhost:3000
```

## Where to put keys (`.env`)

| Key | Purpose | Required |
| --- | --- | --- |
| `GROQ_API_KEY` | **Free** — powers the tutor brain in `/api/tutor`, `/api/translate`, and Whisper STT at `/api/stt`. Get one at [console.groq.com/keys](https://console.groq.com/keys) | Recommended |
| `GROQ_MODEL` | Defaults to `llama-3.3-70b-versatile` | No |
| `GROQ_STT_MODEL` | Defaults to `whisper-large-v3-turbo` | No |
| `OPENAI_API_KEY` | Optional paid fallback; used only when `GROQ_API_KEY` is unset | No |
| `NEXT_PUBLIC_ELEVENLABS_API_KEY` + `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` | Realistic TTS instead of browser `speechSynthesis` | No |
| `NEXT_PUBLIC_REALTIME_MODEL` | OpenAI Realtime model name for the browser WebSocket slot (paid) | No |

Note: keys prefixed `NEXT_PUBLIC_` are exposed to the browser. For production, proxy
ElevenLabs and Realtime sessions through server routes instead.

## Structure

```
src/
  app/
    page.tsx                 # Main voice tutor screen
    layout.tsx, globals.css
    api/tutor/route.ts       # Chat endpoint + Alex system prompt (unit injected)
    api/translate/route.ts   # English -> Bengali translation endpoint
    api/stt/route.ts         # Whisper transcription slot (multipart audio)
  components/
    CurriculumSidebar.tsx    # 4 phases / 20 units roadmap, progress, notes
    VoiceOrb.tsx             # Animated listening/speaking orb
    TranscriptPanel.tsx      # Live transcript + per-message Bengali translate
    MicButton.tsx            # Push-to-talk / auto-listen controls
    IeltsTimer.tsx           # Part 2: 1-min prep + 2-min speaking timers
  hooks/
    useSpeech.ts             # SpeechRecognition (STT) + speechSynthesis/ElevenLabs (TTS)
    useProgress.ts           # localStorage: current unit, completed units, notes
  lib/
    curriculum.ts            # 4 phases, 20 units with lesson topics + quiz hints
    prompt.ts                # buildSystemPrompt(): Alex persona, bilingual rules
```

## Fallback behavior

- **No Groq/OpenAI key:** the tutor replies in demo mode offline (short scripted bilingual
  coach lines) so the UI and voice loop always work; add a free Groq key for the real tutor.
- **Speech recognition unsupported** (Firefox): push-to-talk is disabled with a hint,
  typing a message still works.
- **TTS order:** ElevenLabs (if key set) → browser `speechSynthesis`.
