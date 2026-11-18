export type UnitKind = "standard" | "ielts_part1" | "ielts_part2" | "ielts_part3" | "ielts_band";

export interface Unit {
  id: number;
  phase: number;
  title: string;
  topic: string;
  focus: string;
  kind: UnitKind;
}

export interface Phase {
  id: number;
  title: string;
  goal: string;
  englishShare: number;
  units: Unit[];
}

export const PHASES: Phase[] = [
  {
    id: 1,
    title: "Foundation",
    goal: "Build basic confidence with core everyday English, explained in Bengali.",
    englishShare: 0.3,
    units: [
      { id: 1, phase: 1, title: "Greetings & Introductions", topic: "greetings, introducing yourself, saying your name, where you are from, and polite hello/goodbye phrases", focus: "am/is/are, my name is, I am from", kind: "standard" },
      { id: 2, phase: 1, title: "Numbers, Time & Days", topic: "numbers, telling the time, days of the week, and months", focus: "It is ... o'clock, on Monday, in January", kind: "standard" },
      { id: 3, phase: 1, title: "Daily Routine", topic: "describing your daily routine from morning to night", focus: "present simple, I wake up / I eat / I go", kind: "standard" },
      { id: 4, phase: 1, title: "Basic Tenses", topic: "the three basic tenses in simple everyday sentences", focus: "present simple vs past simple vs future with will/going to", kind: "standard" },
      { id: 5, phase: 1, title: "Everyday Vocabulary", topic: "essential everyday vocabulary: family, food, home, work or study, and shopping", focus: "have/has, there is/there are, countable nouns", kind: "standard" }
    ]
  },
  {
    id: 2,
    title: "Conversational Fluency",
    goal: "Hold a real conversation: ask questions, give opinions, handle common situations.",
    englishShare: 0.6,
    units: [
      { id: 6, phase: 2, title: "Asking & Answering Questions", topic: "forming and answering questions in conversation", focus: "do/does/did questions, wh-questions, short answers", kind: "standard" },
      { id: 7, phase: 2, title: "Expressing Opinions", topic: "giving your opinion politely and agreeing or disagreeing", focus: "I think, I believe, in my opinion, me too, I am not sure", kind: "standard" },
      { id: 8, phase: 2, title: "Roleplay: Restaurant", topic: "roleplaying a restaurant scene: booking a table, ordering food, and asking for the bill", focus: "could I have, I would like, how much is", kind: "standard" },
      { id: 9, phase: 2, title: "Roleplay: Airport", topic: "roleplaying an airport journey: check-in, security, boarding, and small problems", focus: "modal verbs of request, present continuous for travel plans", kind: "standard" },
      { id: 10, phase: 2, title: "Small Talk & Phone Calls", topic: "small talk with strangers and simple phone conversations", focus: "how is it going, small talk topics, may I speak to", kind: "standard" }
    ]
  },
  {
    id: 3,
    title: "Advanced Expression",
    goal: "Sound natural and expressive: idioms, phrasal verbs, and structured debate.",
    englishShare: 0.85,
    units: [
      { id: 11, phase: 3, title: "Common Idioms", topic: "ten common English idioms used in daily life and how to use them naturally", focus: "idiom meaning vs literal meaning, used in real sentences", kind: "standard" },
      { id: 12, phase: 3, title: "Phrasal Verbs", topic: "high-frequency phrasal verbs for work, study, and daily life", focus: "get up, look after, run out of, put off, come across", kind: "standard" },
      { id: 13, phase: 3, title: "Storytelling & Past Narratives", topic: "telling a short personal story with a clear beginning, middle, and end", focus: "past continuous + past simple, time connectors", kind: "standard" },
      { id: 14, phase: 3, title: "Debating & Persuasion", topic: "presenting an argument, supporting it with reasons, and responding to the other side politely", focus: "on one hand, however, that said, my strongest point is", kind: "standard" },
      { id: 15, phase: 3, title: "Fluency Practice: Free Talk", topic: "extended free conversation on varied topics with naturally flowing English", focus: "connectors, avoiding long pauses, self-correction", kind: "standard" }
    ]
  },
  {
    id: 4,
    title: "IELTS Speaking Mastery",
    goal: "Exam-focused training for all three IELTS Speaking parts plus band evaluation.",
    englishShare: 1.0,
    units: [
      { id: 16, phase: 4, title: "IELTS Part 1: Interview", topic: "IELTS Speaking Part 1 interview questions about home, work, study, and daily life, answered with expansion", focus: "answer plus reason plus example, 2 to 3 sentences per answer", kind: "ielts_part1" },
      { id: 17, phase: 4, title: "IELTS Part 2: Cue Card", topic: "IELTS Speaking Part 2 cue card: one minute preparation then a two minute long turn", focus: "note-taking, covering all bullet points, speaking the full two minutes", kind: "ielts_part2" },
      { id: 18, phase: 4, title: "IELTS Part 3: Discussion", topic: "IELTS Speaking Part 3 abstract discussion questions with structured, well-developed answers", focus: "opinion, reason, example, contrast, balanced views", kind: "ielts_part3" },
      { id: 19, phase: 4, title: "Pronunciation & Fluency Labs", topic: "targeted pronunciation, word stress, intonation, and filler-word reduction drills", focus: "word stress, sentence stress, connected speech", kind: "standard" },
      { id: 20, phase: 4, title: "Mock Test & Band Score", topic: "a full IELTS speaking mock test across all parts, followed by an estimated band score with feedback", focus: "fluency and coherence, lexical resource, grammatical range, pronunciation", kind: "ielts_band" }
    ]
  }
];

export const ALL_UNITS: Unit[] = PHASES.flatMap((p) => p.units);

export function getUnit(id: number): Unit | undefined {
  return ALL_UNITS.find((u) => u.id === id);
}

export function getPhase(id: number): Phase | undefined {
  return PHASES.find((p) => p.id === id);
}

export const QUIZ_QUESTIONS_PER_UNIT = 2;
