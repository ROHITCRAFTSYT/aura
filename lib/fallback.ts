import type {
  Scenario,
  Difficulty,
  ChatMessage,
  PracticeReply,
  DecodeResult,
  CheckinResult,
} from "@/lib/types";

/**
 * High-quality, context-aware canned responses. These keep every feature
 * working when no ANTHROPIC_API_KEY is set, or when a live call fails. The
 * voice matches the AI prompts: warm, literal, concrete, and concise.
 */

/** Count how many turns the user has actually taken in the conversation. */
function userTurnCount(messages: ChatMessage[]): number {
  return messages.filter((m) => m.role === "user").length;
}

/** Per-scenario partner lines, varied by whether this is the opening turn. */
function partnerReply(
  scenarioId: string,
  scenario: Scenario,
  isFirstTurn: boolean,
): string {
  switch (scenarioId) {
    case "cafe":
      return isFirstTurn
        ? "Hi there! What can I get started for you today?"
        : "Great choice. I'll have that ready for you in just a moment.";
    case "group":
      return isFirstTurn
        ? "Oh hey! Yeah, we were just talking about that show. Have you seen the latest episode?"
        : "That's such a good point. It's nice to meet someone else who likes it.";
    case "interview":
      return isFirstTurn
        ? "Thanks for coming in. To start, can you tell me a little about why you'd like to work here?"
        : "That's a thoughtful answer. Thank you for sharing that with me.";
    case "doctor":
      return isFirstTurn
        ? "Good morning, this is the clinic. How can I help you today?"
        : "Okay, I can book that for you. Let me find a time that works.";
    case "disagree":
      return isFirstTurn
        ? "Hey! I was thinking we could go to the big concert this weekend, it'll be so loud and fun!"
        : "Oh, I hadn't thought about that. We could do something quieter instead, that's fair.";
    case "feedback":
      return isFirstTurn
        ? "Hi! Of course you can ask me. What part wasn't clear?"
        : "That's a really good question to ask. Let me explain it another way.";
    default:
      return isFirstTurn
        ? `Hello! I'm ${scenario.partner}. Go ahead whenever you're ready.`
        : "Thank you for sharing that. Please go on.";
  }
}

/** Coach feedback that adapts to the difficulty, kept generic-but-relevant. */
function coachFor(difficulty: Difficulty): PracticeReply["coach"] {
  const base = {
    gentle: {
      note: "You started really well — that took courage, and it came across as kind.",
      score: 88,
      tip: "Next time, you could add one small detail to keep the conversation going.",
    },
    real: {
      note: "Nice work. Your message was clear and easy to understand.",
      score: 82,
      tip: "Try ending with a short question to invite the other person to reply.",
    },
    challenge: {
      note: "Good job staying calm and clear, even with a bit of pressure.",
      score: 78,
      tip: "If you feel unsure, it's okay to take a breath before you answer.",
    },
  } as const;
  return base[difficulty];
}

export function practiceFallback(
  scenario: Scenario,
  difficulty: Difficulty,
  messages: ChatMessage[],
): PracticeReply {
  const turns = userTurnCount(messages);
  // Treat the very first user turn (or an empty start) as the opening exchange.
  const isFirstTurn = turns <= 1;
  return {
    reply: partnerReply(scenario.id, scenario, isFirstTurn),
    coach: coachFor(difficulty),
  };
}

/** Simple, transparent sarcasm detection for the offline path. */
const SARCASM_MARKERS = ["yeah right", "sure...", "sure ...", "great 🙄", "oh great", "🙄"];

export function decodeFallback(text: string, context?: string): DecodeResult {
  const lower = text.toLowerCase();
  const notLiteral = SARCASM_MARKERS.some((marker) => lower.includes(marker));

  if (notLiteral) {
    return {
      literal:
        "The plain words seem positive, but they probably do not mean exactly what they say.",
      tone: "This sounds like it might be sarcasm — saying one thing while meaning the opposite.",
      vibe: "Joking",
      notLiteral: true,
      replies: [
        "It's okay to ask: \"Did you mean that, or were you joking?\"",
        "You can answer lightly: \"Ha, I wasn't sure if you were being serious!\"",
        "If you're unsure, a simple \"What do you mean?\" is always fine.",
      ],
    };
  }

  return {
    literal:
      "Taken at face value, this message means what the words plainly say." +
      (context ? " The context you gave suggests it is meant directly." : ""),
    tone: "It reads as neutral and direct. There is no strong sign of hidden meaning.",
    vibe: "Unclear",
    notLiteral: false,
    replies: [
      "You can respond simply and honestly with what you think.",
      "If you're not sure what they want, it's fine to ask them to explain.",
      "A short, friendly reply like \"Okay, thanks for letting me know\" works well.",
    ],
  };
}

export function checkinFallback(
  mood: number,
  energy: number,
  note?: string,
): CheckinResult {
  // Bucket the mood into low / medium / high so the reflection adapts.
  const m = Math.max(1, Math.min(5, Math.round(mood)));
  const e = Math.max(1, Math.min(5, Math.round(energy)));

  let reflection: string;
  let grounding: string;

  if (m <= 2) {
    reflection =
      "It sounds like today feels heavy, and that's completely okay. " +
      "Your feelings are real, and you don't have to fix them right now.";
    grounding =
      "Try one slow breath: in for four counts, hold for four, out for four. Just one is enough to start.";
  } else if (m === 3) {
    reflection =
      "You're somewhere in the middle today, and that's a perfectly normal place to be. " +
      "Thank you for checking in with yourself.";
    grounding =
      "A small reset can help — maybe a glass of water or a short stretch wherever you are.";
  } else {
    reflection =
      "It's good to hear today feels brighter. Noticing the good moments is a real strength.";
    grounding =
      "If it feels nice, take a moment to enjoy something small you like — a song, a snack, or fresh air.";
  }

  // Gently acknowledge low energy regardless of mood.
  if (e <= 2) {
    grounding +=
      " Your energy seems low too, so be gentle with yourself and rest if you can.";
  }

  if (note && note.trim().length > 0) {
    reflection += " Thank you for sharing what's on your mind.";
  }

  return { reflection, grounding };
}
