/**
 * Shared contract between the client features and the /api/chat route.
 * Both the route handler and the feature pages import from here so they never
 * drift apart.
 */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type Difficulty = "gentle" | "real" | "challenge";

/** Practice Studio: a roleplay scenario. */
export interface Scenario {
  id: string;
  title: string;
  emoji: string;
  /** Who the AI plays. */
  partner: string;
  /** One-line situation shown to the user. */
  setup: string;
  /** Category pill. */
  tag: string;
}

/** Body sent to POST /api/chat. */
export type ChatRequest =
  | {
      mode: "practice";
      scenarioId: string;
      difficulty: Difficulty;
      messages: ChatMessage[];
    }
  | {
      mode: "decode";
      text: string;
      context?: string;
    }
  | {
      mode: "checkin";
      mood: number; // 1..5
      energy: number; // 1..5
      note?: string;
    };

/** Source tells the UI whether this was live Claude or the offline fallback. */
export type ResponseSource = "ai" | "fallback";

export interface PracticeReply {
  /** What the roleplay partner says next. */
  reply: string;
  /** Gentle coach feedback on the user's last message. */
  coach: {
    note: string;
    /** 0..100 confidence/warmth meter for the user's last turn. */
    score: number;
    /** One concrete, kind tip. */
    tip: string;
  };
}

export interface DecodeResult {
  literal: string;
  tone: string;
  /** e.g. "Friendly", "Joking", "Serious", "Unclear" */
  vibe: string;
  /** true if likely sarcasm/joke rather than literal. */
  notLiteral: boolean;
  replies: string[];
}

export interface CheckinResult {
  reflection: string;
  grounding: string;
}

export type ChatResponse =
  | { mode: "practice"; source: ResponseSource; data: PracticeReply }
  | { mode: "decode"; source: ResponseSource; data: DecodeResult }
  | { mode: "checkin"; source: ResponseSource; data: CheckinResult };
