/**
 * Bring-your-own-key configuration.
 *
 * Aura runs in demo mode by default (built-in fallback responses). A user can
 * connect ANY major AI provider with their own key for live, smarter replies.
 * The key is stored only on this device (localStorage) and is sent to Aura's
 * own API route purely to relay the request to the chosen provider. It is never
 * stored on a server, logged, or shared.
 *
 * Two call shapes cover every provider:
 *   - "anthropic": the native Claude Messages API
 *   - "openai":    the OpenAI-compatible /chat/completions API, which OpenAI,
 *                  Google Gemini, OpenRouter, Groq, Mistral, DeepSeek and most
 *                  others expose.
 */

export type AiProvider =
  | "anthropic"
  | "openai"
  | "gemini"
  | "openrouter"
  | "groq"
  | "mistral"
  | "deepseek"
  | "custom";

export type ProviderKind = "anthropic" | "openai";

export interface ProviderPreset {
  value: AiProvider;
  label: string;
  kind: ProviderKind;
  baseUrl: string;
  defaultModel: string;
  keyHint: string;
  keysUrl: string;
  needsBaseUrl?: boolean;
}

export const PROVIDERS: ProviderPreset[] = [
  {
    value: "anthropic",
    label: "Anthropic — Claude",
    kind: "anthropic",
    baseUrl: "https://api.anthropic.com",
    defaultModel: "claude-3-5-sonnet-latest",
    keyHint: "sk-ant-…",
    keysUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    value: "openai",
    label: "OpenAI — GPT",
    kind: "openai",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    keyHint: "sk-…",
    keysUrl: "https://platform.openai.com/api-keys",
  },
  {
    value: "gemini",
    label: "Google — Gemini",
    kind: "openai",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModel: "gemini-2.0-flash",
    keyHint: "AIza…",
    keysUrl: "https://aistudio.google.com/apikey",
  },
  {
    value: "openrouter",
    label: "OpenRouter — many models",
    kind: "openai",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    keyHint: "sk-or-…",
    keysUrl: "https://openrouter.ai/keys",
  },
  {
    value: "groq",
    label: "Groq — fast & free tier",
    kind: "openai",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    keyHint: "gsk_…",
    keysUrl: "https://console.groq.com/keys",
  },
  {
    value: "mistral",
    label: "Mistral",
    kind: "openai",
    baseUrl: "https://api.mistral.ai/v1",
    defaultModel: "mistral-small-latest",
    keyHint: "your key",
    keysUrl: "https://console.mistral.ai/api-keys",
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    kind: "openai",
    baseUrl: "https://api.deepseek.com",
    defaultModel: "deepseek-chat",
    keyHint: "sk-…",
    keysUrl: "https://platform.deepseek.com/api_keys",
  },
  {
    value: "custom",
    label: "Custom (OpenAI-compatible)",
    kind: "openai",
    baseUrl: "",
    defaultModel: "",
    keyHint: "your key",
    keysUrl: "",
    needsBaseUrl: true,
  },
];

export function getPreset(provider: AiProvider): ProviderPreset {
  return PROVIDERS.find((p) => p.value === provider) ?? PROVIDERS[0];
}

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  baseUrl: string; // used for "custom"; otherwise the preset's
}

/** What the client sends to /api/chat to relay a request. */
export interface AiPayload {
  kind: ProviderKind;
  apiKey: string;
  model: string;
  baseUrl: string;
}

export const AI_STORAGE_KEY = "aura.ai.v1";

export function loadAiConfig(): AiConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AiConfig>;
    if (!parsed || typeof parsed.apiKey !== "string" || !parsed.apiKey) return null;
    const provider = (parsed.provider as AiProvider) ?? "anthropic";
    const preset = getPreset(provider);
    return {
      provider,
      apiKey: parsed.apiKey,
      model: parsed.model || preset.defaultModel,
      baseUrl: parsed.baseUrl || preset.baseUrl,
    };
  } catch {
    return null;
  }
}

export function saveAiConfig(config: AiConfig): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* ignore quota/availability errors */
  }
}

export function clearAiConfig(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AI_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Resolve the stored config into the payload sent with each request. */
export function resolveAiPayload(): AiPayload | null {
  const config = loadAiConfig();
  if (!config || !config.apiKey.trim()) return null;
  const preset = getPreset(config.provider);
  const baseUrl = (config.baseUrl || preset.baseUrl).replace(/\/+$/, "");
  if (!baseUrl) return null; // custom with no base URL — can't call
  return {
    kind: preset.kind,
    apiKey: config.apiKey.trim(),
    model: config.model.trim() || preset.defaultModel,
    baseUrl,
  };
}
