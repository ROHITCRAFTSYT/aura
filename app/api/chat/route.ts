import { NextResponse } from "next/server";
import type {
  ChatRequest,
  ChatResponse,
  ChatMessage,
  Difficulty,
  PracticeReply,
  DecodeResult,
  CheckinResult,
} from "@/lib/types";
import type { AiPayload, ProviderKind } from "@/lib/aiConfig";
import { getScenario, SCENARIOS } from "@/lib/scenarios";
import { practiceSystem, decodeSystem, checkinSystem } from "@/lib/prompts";
import {
  practiceFallback,
  decodeFallback,
  checkinFallback,
} from "@/lib/fallback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENV_MODEL = "claude-opus-4-8";
const MAX_TOKENS = 700;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Parse JSON robustly. First try a plain JSON.parse; if that fails, extract the
 * first balanced {...} substring and parse that (covers models that wrap JSON
 * in prose or code fences). Returns null on failure.
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
        try {
          return JSON.parse(trimmed.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Provider selection + calling
// ---------------------------------------------------------------------------

/** Read a user-supplied bring-your-own-key payload from the request body. */
function readUserAi(body: unknown): AiPayload | null {
  if (!isRecord(body)) return null;
  const ai = body.ai;
  if (!isRecord(ai)) return null;
  const apiKey = typeof ai.apiKey === "string" ? ai.apiKey.trim() : "";
  if (!apiKey) return null;
  const kind: ProviderKind = ai.kind === "anthropic" ? "anthropic" : "openai";
  const model =
    typeof ai.model === "string" && ai.model.trim()
      ? ai.model.trim()
      : kind === "anthropic"
        ? "claude-3-5-sonnet-latest"
        : "gpt-4o-mini";
  let baseUrl =
    typeof ai.baseUrl === "string" ? ai.baseUrl.trim().replace(/\/+$/, "") : "";
  if (!baseUrl)
    baseUrl = kind === "anthropic" ? "https://api.anthropic.com" : "https://api.openai.com/v1";
  return { kind, apiKey, model, baseUrl };
}

/** User key wins; otherwise fall back to a server ANTHROPIC_API_KEY if present. */
function effectiveAi(body: unknown): AiPayload | null {
  const user = readUserAi(body);
  if (user) return user;
  const env = process.env.ANTHROPIC_API_KEY;
  if (env && env.trim()) {
    return {
      kind: "anthropic",
      apiKey: env.trim(),
      model: ENV_MODEL,
      baseUrl: "https://api.anthropic.com",
    };
  }
  return null;
}

/** Call the chosen provider and return its raw text reply, or throw. */
async function callLLM(
  system: string,
  messages: ChatMessage[],
  ai: AiPayload,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    if (ai.kind === "anthropic") {
      const res = await fetch(`${ai.baseUrl}/v1/messages`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "x-api-key": ai.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: ai.model,
          max_tokens: MAX_TOKENS,
          system,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error(`anthropic ${res.status}`);
      const data = (await res.json()) as {
        content?: Array<{ type?: string; text?: string }>;
      };
      const block = data.content?.find((b) => b?.type === "text");
      return block?.text ?? null;
    }

    // OpenAI-compatible (OpenAI, Gemini, OpenRouter, Groq, Mistral, DeepSeek, custom)
    const res = await fetch(`${ai.baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ai.apiKey}`,
      },
      body: JSON.stringify({
        model: ai.model,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: system },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });
    if (!res.ok) throw new Error(`openai-compatible ${res.status}`);
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? null;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Per-mode validation + normalization
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
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(genericCheckinFallback());
  }

  const ai = effectiveAi(raw);
  const body = raw as ChatRequest;

  try {
    switch (body?.mode) {
      case "practice":
        return NextResponse.json(await handlePractice(body, ai));
      case "decode":
        return NextResponse.json(await handleDecode(body, ai));
      case "checkin":
        return NextResponse.json(await handleCheckin(body, ai));
      default:
        return NextResponse.json(genericCheckinFallback());
    }
  } catch {
    return NextResponse.json(safeFallbackFor(body));
  }
}

// ---------------------------------------------------------------------------
// Mode handlers
// ---------------------------------------------------------------------------

async function handlePractice(
  body: Extract<ChatRequest, { mode: "practice" }>,
  ai: AiPayload | null,
): Promise<ChatResponse> {
  const scenario = getScenario(body.scenarioId) ?? SCENARIOS[0];
  const difficulty: Difficulty = body.difficulty ?? "real";
  const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];

  if (ai) {
    try {
      const text = await callLLM(practiceSystem(scenario, difficulty), messages, ai);
      const parsed = text ? validatePractice(parseJsonLoose(text)) : null;
      if (parsed) return { mode: "practice", source: "ai", data: parsed };
    } catch {
      /* fall through to fallback */
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
  ai: AiPayload | null,
): Promise<ChatResponse> {
  const text = typeof body.text === "string" ? body.text : "";
  const context = typeof body.context === "string" ? body.context : undefined;

  if (ai) {
    try {
      const userContent = context
        ? `Message: ${text}\n\nContext: ${context}`
        : `Message: ${text}`;
      const out = await callLLM(decodeSystem(), [{ role: "user", content: userContent }], ai);
      const parsed = out ? validateDecode(parseJsonLoose(out)) : null;
      if (parsed) return { mode: "decode", source: "ai", data: parsed };
    } catch {
      /* fall through */
    }
  }

  return { mode: "decode", source: "fallback", data: decodeFallback(text, context) };
}

async function handleCheckin(
  body: Extract<ChatRequest, { mode: "checkin" }>,
  ai: AiPayload | null,
): Promise<ChatResponse> {
  const mood = clampInt(body.mood, 1, 5, 3);
  const energy = clampInt(body.energy, 1, 5, 3);
  const note = typeof body.note === "string" ? body.note : undefined;

  if (ai) {
    try {
      const noteLine = note && note.trim().length > 0 ? `\nNote: ${note}` : "";
      const userContent = `Mood: ${mood} out of 5\nEnergy: ${energy} out of 5${noteLine}`;
      const out = await callLLM(checkinSystem(), [{ role: "user", content: userContent }], ai);
      const parsed = out ? validateCheckin(parseJsonLoose(out)) : null;
      if (parsed) return { mode: "checkin", source: "ai", data: parsed };
    } catch {
      /* fall through */
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
  return { mode: "checkin", source: "fallback", data: checkinFallback(3, 3) };
}

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
