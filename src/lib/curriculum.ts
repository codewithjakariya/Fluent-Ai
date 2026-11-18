export type UnitKind = "standard" | "ielts_part1" | "ielts_part2" | "ielts_part3" | "ielts_band";

export interface Lesson {
  id: number;
  title: string;
  goal: string;
}

export interface Unit {
  id: number;
  phase: number;
  title: string;
  topic: string;
  focus: string;
  kind: UnitKind;
  lessons: Lesson[];
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
      {
        id: 1, phase: 1, title: "Greetings & Introductions",
        topic: "greetings, introducing yourself, saying your name, where you are from, and polite hello/goodbye phrases",
        focus: "am/is/are, my name is, I am from", kind: "standard",
        lessons: [
          { id: 1, title: "Hello & Goodbye", goal: "use hello, hi, good morning, see you later naturally" },
          { id: 2, title: "Introducing Yourself", goal: "say your name, age, and where you are from" },
          { id: 3, title: "Meeting Someone New", goal: "ask and answer basic getting-to-know-you questions" }
        ]
      },
      {
        id: 2, phase: 1, title: "Numbers, Time & Days",
        topic: "numbers, telling the time, days of the week, and months",
        focus: "It is ... o'clock, on Monday, in January", kind: "standard",
        lessons: [
          { id: 1, title: "Counting & Numbers", goal: "count and talk about quantities up to thousands" },
          { id: 2, title: "Telling the Time", goal: "say clock times and talk about schedules" },
          { id: 3, title: "Days & Months", goal: "talk about days, dates, and months of the year" }
        ]
      },
      {
        id: 3, phase: 1, title: "Daily Routine",
        topic: "describing your daily routine from morning to night",
        focus: "present simple, I wake up / I eat / I go", kind: "standard",
        lessons: [
          { id: 1, title: "My Morning", goal: "describe your morning activities step by step" },
          { id: 2, title: "My Afternoon & Evening", goal: "describe what you do after school or work" },
          { id: 3, title: "Weekend Routine", goal: "compare weekday and weekend routines" }
        ]
      },
      {
        id: 4, phase: 1, title: "Basic Tenses",
        topic: "the three basic tenses in simple everyday sentences",
        focus: "present simple vs past simple vs future with will/going to", kind: "standard",
        lessons: [
          { id: 1, title: "Present Simple", goal: "talk about habits and facts in the present" },
          { id: 2, title: "Past Simple", goal: "describe completed actions yesterday or earlier" },
          { id: 3, title: "Future Plans", goal: "express plans with will and going to" }
        ]
      },
      {
        id: 5, phase: 1, title: "Everyday Vocabulary",
        topic: "essential everyday vocabulary: family, food, home, work or study, and shopping",
        focus: "have/has, there is/there are, countable nouns", kind: "standard",
        lessons: [
          { id: 1, title: "Family & People", goal: "describe your family members and relationships" },
          { id: 2, title: "Food & Home", goal: "talk about meals, groceries, and your home" },
          { id: 3, title: "Shopping Basics", goal: "handle simple buying and selling conversations" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Conversational Fluency",
    goal: "Hold a real conversation: ask questions, give opinions, handle common situations.",
    englishShare: 0.6,
    units: [
      {
        id: 6, phase: 2, title: "Asking & Answering Questions",
        topic: "forming and answering questions in conversation",
        focus: "do/does/did questions, wh-questions, short answers", kind: "standard",
        lessons: [
          { id: 1, title: "Yes/No Questions", goal: "form and answer do/does/did questions" },
          { id: 2, title: "Wh- Questions", goal: "ask what, where, when, why, how questions correctly" },
          { id: 3, title: "Follow-up Questions", goal: "keep a conversation going with follow-ups" }
        ]
      },
      {
        id: 7, phase: 2, title: "Expressing Opinions",
        topic: "giving your opinion politely and agreeing or disagreeing",
        focus: "I think, I believe, in my opinion, me too, I am not sure", kind: "standard",
        lessons: [
          { id: 1, title: "I Think…", goal: "state simple opinions with reasons" },
          { id: 2, title: "Agreeing & Disagreeing", goal: "agree and disagree politely" },
          { id: 3, title: "Comparing Choices", goal: "compare two options and say which you prefer" }
        ]
      },
      {
        id: 8, phase: 2, title: "Roleplay: Restaurant",
        topic: "roleplaying a restaurant scene: booking a table, ordering food, and asking for the bill",
        focus: "could I have, I would like, how much is", kind: "standard",
        lessons: [
          { id: 1, title: "Booking a Table", goal: "reserve a table by phone or in person" },
          { id: 2, title: "Ordering Food", goal: "order dishes and drinks politely" },
          { id: 3, title: "Paying the Bill", goal: "ask for the bill and handle payment talk" }
        ]
      },
      {
        id: 9, phase: 2, title: "Roleplay: Airport",
        topic: "roleplaying an airport journey: check-in, security, boarding, and small problems",
        focus: "modal verbs of request, present continuous for travel plans", kind: "standard",
        lessons: [
          { id: 1, title: "Check-in & Ticket", goal: "check in and answer staff questions" },
          { id: 2, title: "Security & Boarding", goal: "follow and clarify airport instructions" },
          { id: 3, title: "Travel Problems", goal: "report delays and lost items politely" }
        ]
      },
      {
        id: 10, phase: 2, title: "Small Talk & Phone Calls",
        topic: "small talk with strangers and simple phone conversations",
        focus: "how is it going, small talk topics, may I speak to", kind: "standard",
        lessons: [
          { id: 1, title: "Weather & Small Talk", goal: "start friendly chit-chat on safe topics" },
          { id: 2, title: "Making a Phone Call", goal: "open, handle, and end simple calls" },
          { id: 3, title: "Leaving a Message", goal: "take and leave clear messages on the phone" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Advanced Expression",
    goal: "Sound natural and expressive: idioms, phrasal verbs, and structured debate.",
    englishShare: 0.85,
    units: [
      {
        id: 11, phase: 3, title: "Common Idioms",
        topic: "ten common English idioms used in daily life and how to use them naturally",
        focus: "idiom meaning vs literal meaning, used in real sentences", kind: "standard",
        lessons: [
          { id: 1, title: "Daily-Life Idioms", goal: "use five everyday idioms correctly" },
          { id: 2, title: "Feelings Idioms", goal: "express emotions with idioms naturally" },
          { id: 3, title: "Idioms in Conversation", goal: "drop idioms into flowing conversation" }
        ]
      },
      {
        id: 12, phase: 3, title: "Phrasal Verbs",
        topic: "high-frequency phrasal verbs for work, study, and daily life",
        focus: "get up, look after, run out of, put off, come across", kind: "standard",
        lessons: [
          { id: 1, title: "Daily Phrasal Verbs", goal: "use get up, wake up, come over, eat out" },
          { id: 2, title: "Work & Study Phrasal Verbs", goal: "use hand in, put off, catch up on, look into" },
          { id: 3, title: "Phrasal Verbs Under Pressure", goal: "recall phrasal verbs quickly in live conversation" }
        ]
      },
      {
        id: 13, phase: 3, title: "Storytelling & Past Narratives",
        topic: "telling a short personal story with a clear beginning, middle, and end",
        focus: "past continuous + past simple, time connectors", kind: "standard",
        lessons: [
          { id: 1, title: "Setting the Scene", goal: "open a story with time and place" },
          { id: 2, title: "The Main Events", goal: "connect events with first, then, after that" },
          { id: 3, title: "A Good Ending", goal: "close a story with feelings and lessons" }
        ]
      },
      {
        id: 14, phase: 3, title: "Debating & Persuasion",
        topic: "presenting an argument, supporting it with reasons, and responding to the other side politely",
        focus: "on one hand, however, that said, my strongest point is", kind: "standard",
        lessons: [
          { id: 1, title: "Stating Your Case", goal: "present one clear argument with support" },
          { id: 2, title: "Counterarguments", goal: "acknowledge and answer the other side" },
          { id: 3, title: "Mini Debate", goal: "debate a light topic with structured points" }
        ]
      },
      {
        id: 15, phase: 3, title: "Fluency Practice: Free Talk",
        topic: "extended free conversation on varied topics with naturally flowing English",
        focus: "connectors, avoiding long pauses, self-correction", kind: "standard",
        lessons: [
          { id: 1, title: "Keep Talking", goal: "speak 60 seconds without long pauses" },
          { id: 2, title: "Fixing Yourself", goal: "self-correct smoothly instead of restarting" },
          { id: 3, title: "Free Talk Challenge", goal: "hold a 3-minute conversation on any topic" }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "IELTS Speaking Mastery",
    goal: "Exam-focused training for all three IELTS Speaking parts plus band evaluation.",
    englishShare: 1.0,
    units: [
      {
        id: 16, phase: 4, title: "IELTS Part 1: Interview",
        topic: "IELTS Speaking Part 1 interview questions about home, work, study, and daily life, answered with expansion",
        focus: "answer plus reason plus example, 2 to 3 sentences per answer", kind: "ielts_part1",
        lessons: [
          { id: 1, title: "Home & Hometown", goal: "expand answers about where you live" },
          { id: 2, title: "Work & Study", goal: "expand answers about job or studies" },
          { id: 3, title: "Hobbies & Daily Life", goal: "expand everyday-topic answers naturally" }
        ]
      },
      {
        id: 17, phase: 4, title: "IELTS Part 2: Cue Card",
        topic: "IELTS Speaking Part 2 cue card: one minute preparation then a two minute long turn",
        focus: "note-taking, covering all bullet points, speaking the full two minutes", kind: "ielts_part2",
        lessons: [
          { id: 1, title: "People Cue Cards", goal: "describe a person for the full two minutes" },
          { id: 2, title: "Place & Event Cue Cards", goal: "describe places and events with all bullets" },
          { id: 3, title: "Timed Cue Card Drill", goal: "full timed rehearsal with instant feedback" }
        ]
      },
      {
        id: 18, phase: 4, title: "IELTS Part 3: Discussion",
        topic: "IELTS Speaking Part 3 abstract discussion questions with structured, well-developed answers",
        focus: "opinion, reason, example, contrast, balanced views", kind: "ielts_part3",
        lessons: [
          { id: 1, title: "Abstract Questions", goal: "handle ideas-based questions with structure" },
          { id: 2, title: "Compare & Predict", goal: "compare past, present, and the future" },
          { id: 3, title: "Balanced Views", goal: "give two-sided answers with your verdict" }
        ]
      },
      {
        id: 19, phase: 4, title: "Pronunciation & Fluency Labs",
        topic: "targeted pronunciation, word stress, intonation, and filler-word reduction drills",
        focus: "word stress, sentence stress, connected speech", kind: "standard",
        lessons: [
          { id: 1, title: "Word Stress Lab", goal: "stress the right syllable in common words" },
          { id: 2, title: "Sentence Rhythm", goal: "use natural sentence stress and pausing" },
          { id: 3, title: "Cutting Fillers", goal: "speak clearly without um, actually, you know" }
        ]
      },
      {
        id: 20, phase: 4, title: "Mock Test & Band Score",
        topic: "a full IELTS speaking mock test across all parts, followed by an estimated band score with feedback",
        focus: "fluency and coherence, lexical resource, grammatical range, pronunciation", kind: "ielts_band",
        lessons: [
          { id: 1, title: "Full Mock Test", goal: "complete all three exam parts in one sitting" },
          { id: 2, title: "Band Score Review", goal: "hear your estimated band with reasons" },
          { id: 3, title: "Final Polish", goal: "fix your two weakest exam weaknesses" }
        ]
      }
    ]
  }
];

export const ALL_UNITS: Unit[] = PHASES.flatMap((p) => p.units);

export function lessonKey(unitId: number, lessonId: number): string {
  return `${unitId}.${lessonId}`;
}

export function getUnit(id: number): Unit | undefined {
  return ALL_UNITS.find((u) => u.id === id);
}

export function getPhase(id: number): Phase | undefined {
  return PHASES.find((p) => p.id === id);
}

export function getLesson(unitId: number, lessonId: number): Lesson | undefined {
  return getUnit(unitId)?.lessons.find((l) => l.id === lessonId);
}

export const QUIZ_QUESTIONS_PER_UNIT = 2;
export const TOTAL_LESSONS = ALL_UNITS.reduce((sum, u) => sum + u.lessons.length, 0);
