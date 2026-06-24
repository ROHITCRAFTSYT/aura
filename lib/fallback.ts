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
 *
 * The practice path reads the user's latest message and responds to its
 * INTENT (greeting / asking for help / a question / an order / wrapping up),
 * so the partner never just repeats itself.
 */

type Intent = "greeting" | "help" | "question" | "closing" | "specific" | "unclear";

function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}

function userTurnCount(messages: ChatMessage[]): number {
  return messages.filter((m) => m.role === "user").length;
}

function classify(text: string): Intent {
  const t = text.trim().toLowerCase();
  if (t.length === 0) return "unclear";
  if (/(thank|thanks|cheers|bye|goodbye|see you|that'?s all|that is all|i'?m good|im good)\b/.test(t))
    return "closing";
  if (
    /(help|not sure|unsure|don'?t know|dont know|\bidk\b|no idea|confused|recommend|recommendation|suggest|suggestion|what should|which one|which do|any ideas|can you help|need help)/.test(
      t,
    )
  )
    return "help";
  if (t.includes("?") || /^(what|how|when|where|why|who|can|could|do|does|is|are|would|will|may)\b/.test(t))
    return "question";
  if (/^(hi|hey|hello|hiya|yo|good morning|good afternoon|good evening|excuse me)\b/.test(t))
    return "greeting";
  if (t.split(/\s+/).length <= 1 && t.length < 4) return "unclear";
  return "specific";
}

// Per-scenario partner replies, one short list per intent. We pick a variant by
// turn so repeated intents still feel alive.
const REPLIES: Record<string, Record<Intent, string[]>> = {
  cafe: {
    greeting: [
      "Hi there! What can I get for you today?",
      "Welcome in! What would you like?",
    ],
    help: [
      "Of course. The hot chocolate is really popular, and the vanilla latte is lovely. Would you prefer something warm or something cold?",
      "No problem at all. If you like sweet drinks, the caramel latte is great; if you want something simple, a tea or a coffee is always good. What sounds nice?",
    ],
    question: [
      "Good question. Yes, we can do that for you. Would you like anything else?",
      "Sure, that's no trouble at all. Anything to go with it?",
    ],
    closing: [
      "You're welcome. Have a lovely day!",
      "Anytime. Enjoy, and take care!",
    ],
    specific: [
      "Great choice, coming right up. Would you like anything with it?",
      "Lovely, I'll get that ready for you. Anything else?",
    ],
    unclear: [
      "No rush at all. Take your time, and let me know what you'd like.",
      "That's okay, take your time. I'm happy to help when you're ready.",
    ],
  },
  group: {
    greeting: [
      "Oh hey! We were just talking about that show. Have you seen the latest episode?",
      "Hi! Come join us, we're chatting about that show.",
    ],
    help: [
      "No worries, you can just jump in. What did you think of it?",
      "It's easy, just say what you liked. We're friendly, promise.",
    ],
    question: [
      "Good question! I think so too. What about you?",
      "Yeah, totally. Have you got a favourite character?",
    ],
    closing: ["Nice talking with you! See you around.", "Cool, catch you later!"],
    specific: [
      "Oh nice, I felt the same way. It's cool to meet someone who gets it.",
      "Yes, exactly! I love that you noticed that too.",
    ],
    unclear: [
      "No pressure, you can just listen for a bit if you like.",
      "All good, take your time.",
    ],
  },
  interview: {
    greeting: [
      "Thanks for coming in. To start, can you tell me a little about yourself?",
      "Hello, lovely to meet you. What made you apply for this role?",
    ],
    help: [
      "That's okay, take your time. Maybe start with what you enjoy doing.",
      "No problem. You could tell me about something you're good at.",
    ],
    question: [
      "Good question. The hours are flexible and we'd train you fully. Does that sound okay?",
      "Happy to answer that. Yes, that's something we can arrange.",
    ],
    closing: [
      "Thank you, it was great to meet you. We'll be in touch soon.",
      "Thanks for your time today. You did really well.",
    ],
    specific: [
      "That's a thoughtful answer, thank you. What would you say is your biggest strength?",
      "I like that. Can you tell me about a time you worked in a team?",
    ],
    unclear: [
      "Take your time, there's no rush. Whenever you're ready.",
      "It's okay to pause and think. I'm listening.",
    ],
  },
  doctor: {
    greeting: [
      "Good morning, this is the clinic. How can I help you today?",
      "Hello, clinic reception here. What can I do for you?",
    ],
    help: [
      "No problem, I can guide you. Are you after a check-up, or something specific?",
      "That's alright. Just let me know roughly what you need and I'll sort it.",
    ],
    question: [
      "Yes, we have slots this week. Would a morning or an afternoon suit you better?",
      "Good question. We can usually fit you in within a few days.",
    ],
    closing: [
      "You're all booked. Take care, and see you then!",
      "Lovely, that's sorted. Have a good day.",
    ],
    specific: [
      "Okay, I can book that for you. What day works best?",
      "Got it. Let me find a time. Morning or afternoon?",
    ],
    unclear: [
      "No rush, take your time. I'm here when you're ready.",
      "That's okay. Just tell me whenever you're ready.",
    ],
  },
  disagree: {
    greeting: [
      "Hey! I was thinking we could go to the big concert this weekend, it'll be so loud and fun!",
      "Hi! Want to come to the festival with me? It's going to be huge!",
    ],
    help: [
      "Oh, okay. What would feel better for you? I'm happy to change the plan.",
      "That's fair. What kind of thing would you enjoy more?",
    ],
    question: [
      "Hmm, good point. We could, yeah. What were you thinking?",
      "I hadn't thought of that. What would you prefer?",
    ],
    closing: [
      "Okay, sounds good. I'm glad we figured it out!",
      "Cool, let's do that then. Thanks for being honest with me.",
    ],
    specific: [
      "Oh, I hadn't thought about that. Something quieter could be nice too, that's fair.",
      "That makes sense. I still want to hang out, so let's find something that works for both of us.",
    ],
    unclear: [
      "No worries, take your time. We can figure it out together.",
      "That's okay, no pressure at all.",
    ],
  },
  feedback: {
    greeting: [
      "Hi! Of course you can ask me. What part wasn't clear?",
      "Hey, no problem at all. What would you like me to go over?",
    ],
    help: [
      "Sure, let's take it step by step. Which bit is confusing?",
      "Happy to help. Tell me where you got stuck and we'll start there.",
    ],
    question: [
      "Good question. Let me explain it a different way.",
      "That's a fair thing to ask. Here's another way to think about it.",
    ],
    closing: [
      "You're welcome! Come ask me anytime.",
      "Anytime. You did the right thing by asking.",
    ],
    specific: [
      "That's a really good question to ask. Let me walk you through it.",
      "Thanks for telling me. Let's look at it together.",
    ],
    unclear: [
      "No rush, take your time. I'm happy to wait.",
      "It's okay, ask whenever you're ready.",
    ],
  },
};

function partnerReply(
  scenario: Scenario,
  intent: Intent,
  turn: number,
): string {
  const table = REPLIES[scenario.id];
  if (!table) {
    const generic: Record<Intent, string> = {
      greeting: `Hello! I'm ${scenario.partner}. Go ahead whenever you're ready.`,
      help: "Of course, I'm happy to help. What would you like to know?",
      question: "Good question. Yes, I think that works. What do you think?",
      closing: "Thank you for talking with me. Take care!",
      specific: "Thank you for sharing that. Please go on.",
      unclear: "No rush. Take your time, and tell me when you're ready.",
    };
    return generic[intent];
  }
  const list = table[intent];
  return list[turn % list.length];
}

function coachFor(
  difficulty: Difficulty,
  text: string,
  intent: Intent,
): PracticeReply["coach"] {
  const t = text.trim();
  const words = t ? t.split(/\s+/).filter(Boolean).length : 0;
  const polite = /(please|thank|thanks|could you|would you|may i)/i.test(t);
  const asks = intent === "question" || intent === "help" || t.includes("?");

  let score = difficulty === "gentle" ? 84 : difficulty === "real" ? 80 : 76;
  if (polite) score += 6;
  if (asks) score += 4;
  if (words >= 4) score += 4;
  if (words <= 1) score -= 14;
  score = Math.max(45, Math.min(96, score));

  const NOTES: Record<Intent, string> = {
    greeting: "Lovely opener — friendly and clear. That's a warm way to start.",
    help: "Asking for help is a real strength, and you did it well. People are usually glad to help.",
    question: "Good, clear question. Asking keeps the conversation moving.",
    closing: "Kind way to wrap things up. That leaves a good impression.",
    specific: "Clear and easy to follow. Nicely said.",
    unclear:
      "It's okay to take your time. Even a few words is a perfectly fine start.",
  };
  const TIPS: Record<Intent, string> = {
    greeting: "When you're ready, you could say what you'd like next.",
    help: "Adding what you usually like makes it easier for them to suggest something.",
    question: "A 'please' or 'thank you' adds a warm touch.",
    closing: "A quick 'thanks again' is always welcome.",
    specific: "Ending with a small question invites them to reply.",
    unclear:
      "Try a short sentence like \"Hi, could you help me?\" to get going.",
  };

  // Very short, non-greeting messages get specific, kind guidance.
  if (words <= 1 && intent !== "greeting" && intent !== "closing") {
    return {
      note: "That was quite short, which can be hard for someone to reply to.",
      score,
      tip: 'Try adding a few words so they know how to help, like "I\'m not sure what to pick — can you help me choose?"',
    };
  }

  return { note: NOTES[intent], score, tip: TIPS[intent] };
}

export function practiceFallback(
  scenario: Scenario,
  difficulty: Difficulty,
  messages: ChatMessage[],
): PracticeReply {
  const text = lastUserMessage(messages);
  const intent = classify(text);
  const turn = Math.max(0, userTurnCount(messages) - 1);
  return {
    reply: partnerReply(scenario, intent, turn),
    coach: coachFor(difficulty, text, intent),
  };
}

/** Simple, transparent sarcasm detection for the offline path. */
const SARCASM_MARKERS = [
  "yeah right",
  "sure...",
  "sure ...",
  "great 🙄",
  "oh great",
  "🙄",
  "/s",
  "as if",
  "whatever",
  "can't wait",
  "cant wait",
];

export function decodeFallback(text: string, context?: string): DecodeResult {
  const lower = text.toLowerCase();
  const notLiteral = SARCASM_MARKERS.some((marker) => lower.includes(marker));

  if (notLiteral) {
    return {
      literal:
        "The plain words sound positive, but they probably don't mean exactly what they say.",
      tone: "This sounds like it might be sarcasm — saying one thing while meaning the opposite, often when someone is annoyed or joking.",
      vibe: "Joking",
      notLiteral: true,
      replies: [
        'It\'s okay to ask: "Did you mean that, or were you joking?"',
        'You can answer lightly: "Ha, I wasn\'t sure if you were being serious!"',
        'If you\'re unsure, a simple "What do you mean?" is always fine.',
      ],
    };
  }

  return {
    literal:
      "Taken at face value, this message means what the words plainly say." +
      (context ? " The context you added suggests it's meant directly." : ""),
    tone: "It reads as fairly neutral and direct. There's no strong sign of a hidden meaning.",
    vibe: "Unclear",
    notLiteral: false,
    replies: [
      "You can reply simply and honestly with what you think.",
      "If you're not sure what they want, it's fine to ask them to explain.",
      'A short, friendly reply like "Okay, thanks for letting me know" works well.',
    ],
  };
}

export function checkinFallback(
  mood: number,
  energy: number,
  note?: string,
): CheckinResult {
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
      "A small reset can help, maybe a glass of water or a short stretch wherever you are.";
  } else {
    reflection =
      "It's good to hear today feels brighter. Noticing the good moments is a real strength.";
    grounding =
      "If it feels nice, take a moment to enjoy something small you like, a song, a snack, or some fresh air.";
  }

  if (e <= 2) {
    grounding +=
      " Your energy seems low too, so be gentle with yourself and rest if you can.";
  }

  if (note && note.trim().length > 0) {
    reflection += " Thank you for sharing what's on your mind.";
  }

  return { reflection, grounding };
}
