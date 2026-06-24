import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  Difficulty,
  PracticeReply,
  DecodeResult,
  CheckinResult,
} from "@/lib/types";
import { getScenario, SCENARIOS } from "@/lib/scenarios";
import { practiceSystem, decodeSystem, checkinSystem } from "@/lib/prompts";
import {
  practiceFallback,
  decodeFallback,
  checkinFallback,
} from "@/lib/fallback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-4-8";
const MAX_TOKENS = 700;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Clamp a value to an integer within [min, max], falling back to `fallback`. */
function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Parse JSON robustly. First try a plain JSON.parse; if that fails, extract the
 * first balanced {...} substring and parse that. Returns null on failure.
 */
function parseJsonLoose(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to balanced-brace extraction
  }

  const start = trimmed.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const candidate = trimmed.slice(start, i + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/** Extract the first text block from an Anthropic response. */
function extractText(response: Anthropic.Message): string | null {
  for (const block of response.content) {
    if (block.type === "text") return block.text;
  }
  return null;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

// ---------------------------------------------------------------------------
// Per-mode validation + normalization. Each returns the typed data or null.
// ---------------------------------------------------------------------------

function validatePractice(data: unknown): PracticeReply | null {
  if (!isRecord(data)) return null;
  const coach = data.coach;
  if (typeof data.reply !== "string" || !isRecord(coach)) return null;
  if (typeof coach.note !== "string" || typeof coach.tip !== "string") return null;
  return {
    reply: data.reply,
    coach: {
      note: coach.note,
      score: clampInt(coach.score, 0, 100, 75),
      tip: coach.tip,
    },
  };
}

function validateDecode(data: unknown): DecodeResult | null {
  if (!isRecord(data)) return null;
  if (
    typeof data.literal !== "string" ||
    typeof data.tone !== "string" ||
    typeof data.vibe !== "string" ||
    typeof data.notLiteral !== "boolean" ||
    !Array.isArray(data.replies)
  ) {
    return null;
  }
  const replies = data.replies.filter((r): r is string => typeof r === "string");
  if (replies.length === 0) return null;
  return {
    literal: data.literal,
    tone: data.tone,
    vibe: data.vibe,
    notLiteral: data.notLiteral,
    replies,
  };
}

function validateCheckin(data: unknown): CheckinResult | null {
  if (!isRecord(data)) return null;
  if (typeof data.reflection !== "string" || typeof data.grounding !== "string") {
    return null;
  }
  return { reflection: data.reflection, grounding: data.grounding };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    // Malformed body — return a safe, generic fallback rather than a 500.
    return NextResponse.json(genericCheckinFallback());
  }

  try {
    switch (body?.mode) {
      case "practice":
        return NextResponse.json(await handlePractice(body));
      case "decode":
        return NextResponse.json(await handleDecode(body));
      case "checkin":
        return NextResponse.json(await handleCheckin(body));
      default:
        // Unknown mode — answer with a harmless check-in fallback.
        return NextResponse.json(genericCheckinFallback());
    }
  } catch {
    // Absolute safety net: never throw a 500 to the client.
    return NextResponse.json(safeFallbackFor(body));
  }
}

/** Build an Anthropic client if a key exists, else null (use fallback). */
function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.trim().length === 0) return null;
  return new Anthropic({ apiKey: key });
}

// ---------------------------------------------------------------------------
// Mode handlers
// ---------------------------------------------------------------------------

async function handlePractice(
  body: Extract<ChatRequest, { mode: "practice" }>,
): Promise<ChatResponse> {
  const scenario = getScenario(body.scenarioId) ?? SCENARIOS[0];
  const difficulty: Difficulty = body.difficulty ?? "real";
  const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];

  const client = getClient();
  if (client) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: practiceSystem(scenario, difficulty),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      const text = extractText(response);
      const parsed = text ? validatePractice(parseJsonLoose(text)) : null;
      if (parsed) {
        return { mode: "practice", source: "ai", data: parsed };
      }
    } catch {
      // fall through to fallback
    }
  }

  return {
    mode: "practice",
    source: "fallback",
    data: practiceFallback(scenario, difficulty, messages),
  };
}

async function handleDecode(
  body: Extract<ChatRequest, { mode: "decode" }>,
): Promise<ChatResponse> {
  const text = typeof body.text === "string" ? body.text : "";
  const context = typeof body.context === "string" ? body.context : undefined;

  const client = getClient();
  if (client) {
    try {
      const userContent = context
        ? `Message: ${text}\n\nContext: ${context}`
        : `Message: ${text}`;
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: decodeSystem(),
        messages: [{ role: "user", content: userContent }],
      });
      const out = extractText(response);
      const parsed = out ? validateDecode(parseJsonLoose(out)) : null;
      if (parsed) {
        return { mode: "decode", source: "ai", data: parsed };
      }
    } catch {
      // fall through to fallback
    }
  }

  return {
    mode: "decode",
    source: "fallback",
    data: decodeFallback(text, context),
  };
}

async function handleCheckin(
  body: Extract<ChatRequest, { mode: "checkin" }>,
): Promise<ChatResponse> {
  const mood = clampInt(body.mood, 1, 5, 3);
  const energy = clampInt(body.energy, 1, 5, 3);
  const note = typeof body.note === "string" ? body.note : undefined;

  const client = getClient();
  if (client) {
    try {
      const noteLine = note && note.trim().length > 0 ? `\nNote: ${note}` : "";
      const userContent = `Mood: ${mood} out of 5\nEnergy: ${energy} out of 5${noteLine}`;
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: checkinSystem(),
        messages: [{ role: "user", content: userContent }],
      });
      const out = extractText(response);
      const parsed = out ? validateCheckin(parseJsonLoose(out)) : null;
      if (parsed) {
        return { mode: "checkin", source: "ai", data: parsed };
      }
    } catch {
      // fall through to fallback
    }
  }

  return {
    mode: "checkin",
    source: "fallback",
    data: checkinFallback(mood, energy, note),
  };
}

// ---------------------------------------------------------------------------
// Last-resort fallbacks (used only on unexpected/malformed input)
// ---------------------------------------------------------------------------

function genericCheckinFallback(): ChatResponse {
  return {
    mode: "checkin",
    source: "fallback",
    data: checkinFallback(3, 3),
  };
}

/** Pick a sensible fallback shape based on whatever the body claims to be. */
function safeFallbackFor(body: ChatRequest | undefined): ChatResponse {
  if (body?.mode === "practice") {
    const scenario = getScenario(body.scenarioId) ?? SCENARIOS[0];
    const difficulty: Difficulty = body.difficulty ?? "real";
    const messages = Array.isArray(body.messages) ? body.messages : [];
    return {
      mode: "practice",
      source: "fallback",
      data: practiceFallback(scenario, difficulty, messages),
    };
  }
  if (body?.mode === "decode") {
    return {
      mode: "decode",
      source: "fallback",
      data: decodeFallback(typeof body.text === "string" ? body.text : "", body.context),
    };
  }
  if (body?.mode === "checkin") {
    return {
      mode: "checkin",
      source: "fallback",
      data: checkinFallback(
        clampInt(body.mood, 1, 5, 3),
        clampInt(body.energy, 1, 5, 3),
        body.note,
      ),
    };
  }
  return genericCheckinFallback();
}
