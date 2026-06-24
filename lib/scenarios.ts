import type { Scenario } from "@/lib/types";

/** Real-world social situations to rehearse. Shared by Practice UI + fallback. */
export const SCENARIOS: Scenario[] = [
  {
    id: "cafe",
    title: "Ordering at a café",
    emoji: "☕",
    partner: "a friendly barista",
    setup: "You're at the counter and it's your turn to order a drink.",
    tag: "Everyday",
  },
  {
    id: "group",
    title: "Joining a group",
    emoji: "👋",
    partner: "a classmate already chatting with friends",
    setup: "People are talking about a show you also like. You'd like to join in.",
    tag: "Friendship",
  },
  {
    id: "interview",
    title: "A job interview",
    emoji: "💼",
    partner: "a calm hiring manager",
    setup: "You're interviewing for your first part-time job at a bookshop.",
    tag: "Work",
  },
  {
    id: "doctor",
    title: "Calling to book an appointment",
    emoji: "📞",
    partner: "a receptionist at a clinic",
    setup: "You need to phone and book a check-up. You can't see their face.",
    tag: "Phone",
  },
  {
    id: "disagree",
    title: "A small disagreement",
    emoji: "🤝",
    partner: "a friend who wants to do something you don't",
    setup: "Your friend wants a loud, crowded plan. You'd prefer something quieter.",
    tag: "Boundaries",
  },
  {
    id: "feedback",
    title: "Asking for help",
    emoji: "🙋",
    partner: "a patient teacher",
    setup: "You didn't understand an instruction and want to ask without feeling silly.",
    tag: "School",
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
