import type { ChatRequest, ChatResponse } from "@/lib/types";
import { resolveAiPayload } from "@/lib/aiConfig";

/**
 * Single entry point the feature pages use to talk to /api/chat. It attaches
 * the user's bring-your-own-key config (if any) so the server can relay to the
 * chosen provider. With no key configured, the server answers from the built-in
 * fallback, so this always resolves to a usable ChatResponse.
 */
export async function postChat(body: ChatRequest): Promise<ChatResponse> {
  const ai = resolveAiPayload();
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ai ? { ...body, ai } : body),
  });
  return (await res.json()) as ChatResponse;
}
