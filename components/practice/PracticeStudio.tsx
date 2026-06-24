"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Pill, SectionLabel } from "@/components/ui/Card";
import { ThinkingDots } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { getScenario, SCENARIOS } from "@/lib/scenarios";
import type {
  ChatMessage,
  ChatResponse,
  Difficulty,
  PracticeReply,
  ResponseSource,
} from "@/lib/types";
import { ChatBubble } from "@/components/practice/ChatBubble";
import { CoachPanel } from "@/components/practice/CoachPanel";

const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
  { value: "gentle", label: "Gentle", hint: "Warm and forgiving" },
  { value: "real", label: "Realistic", hint: "Like everyday life" },
  { value: "challenge", label: "Challenge", hint: "A little more spice" },
];

// Optional openers for the "I don't know how to start" moment — tap to fill,
// then edit or send. Lowering that first barrier is the whole point.
const STARTERS: Record<string, string[]> = {
  cafe: [
    "Hi, could I get a hot chocolate, please?",
    "What would you recommend?",
  ],
  group: [
    "Hi — mind if I join? I love this too.",
    "Oh, I watched that last night!",
  ],
  interview: [
    "Hello, thank you for seeing me today.",
    "I'm really interested in this role.",
  ],
  doctor: [
    "Hi, I'd like to book a check-up, please.",
    "Hello — when is your next free slot?",
  ],
  disagree: [
    "I'd love to, but could we do something quieter?",
    "Big crowds are hard for me — can we tweak the plan?",
  ],
  feedback: [
    "Sorry, could you explain that part again?",
    "I didn't quite follow — could you help?",
  ],
};

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
}

function encouragement(avg: number): string {
  if (avg >= 85)
    return "You showed real warmth and clarity. That takes courage — be proud of this.";
  if (avg >= 70)
    return "You kept it kind and clear. Every practice like this makes the real thing easier.";
  return "You showed up and tried, and that matters most. Come back whenever you'd like another go.";
}

export function PracticeStudio() {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("gentle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [coach, setCoach] = useState<PracticeReply["coach"] | null>(null);
  const [source, setSource] = useState<ResponseSource | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [summary, setSummary] = useState(false);

  const scenario = scenarioId ? getScenario(scenarioId) : undefined;
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the chat scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Focus the input when entering the chat view.
  useEffect(() => {
    if (scenario) inputRef.current?.focus();
  }, [scenario]);

  function reset() {
    setScenarioId(null);
    setMessages([]);
    setCoach(null);
    setSource(null);
    setInput("");
    setError(false);
    setLoading(false);
    setScores([]);
    setSummary(false);
  }

  async function send(nextMessages: ChatMessage[]) {
    if (!scenarioId) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "practice",
          scenarioId,
          difficulty,
          messages: nextMessages,
        }),
      });
      const json = (await res.json()) as ChatResponse;
      if (json.mode !== "practice") throw new Error("Unexpected response mode");
      const data: PracticeReply = json.data;
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      setCoach(data.coach);
      setScores((prev) => [...prev, data.coach.score]);
      setSource(json.source);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    void send(nextMessages);
  }

  function retry() {
    // Re-send everything up to and including the last user message.
    const lastUser = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");
    if (lastUser === -1) return;
    const cut = messages.length - lastUser;
    void send(messages.slice(0, cut));
  }

  // ---- Scenario picker view ---------------------------------------------
  if (!scenario) {
    return (
      <div className="flex flex-col gap-8 animate-fade-up">
        <header className="flex flex-col gap-2">
          <SectionLabel>Practice Studio</SectionLabel>
          <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">
            Rehearse a moment, gently
          </h1>
          <p className="max-w-2xl text-ink-soft">
            Pick an everyday situation and practise it with a kind partner. There
            are no wrong answers here — just a calm space to try.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <SectionLabel>1. Choose how it should feel</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-2xl border px-4 py-2.5 text-left transition-all",
                    active
                      ? "border-brand bg-brand-soft text-brand shadow-soft"
                      : "border-border bg-surface text-ink-soft hover:border-brand",
                  )}
                >
                  <span className="block text-sm font-semibold">{d.label}</span>
                  <span className="block text-xs text-ink-faint">{d.hint}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionLabel>2. Pick a scenario</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenarioId(s.id)}
                className="aura-card shadow-soft flex flex-col gap-3 p-5 text-left transition-all hover:shadow-lift hover:-translate-y-0.5 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-3xl" aria-hidden="true">
                    {s.emoji}
                  </span>
                  <Pill tone="neutral">{s.tag}</Pill>
                </div>
                <h3 className="text-base font-semibold text-ink">{s.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {s.setup}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ---- Chat view ---------------------------------------------------------
  const activeDifficulty = DIFFICULTIES.find((d) => d.value === difficulty);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            {scenario.emoji}
          </span>
          <div>
            <h1 className="font-display text-xl font-medium text-ink sm:text-2xl">
              {scenario.title}
            </h1>
            <p className="text-sm text-ink-soft">
              You&apos;re talking with {scenario.partner}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeDifficulty && (
            <Pill tone="calm">{activeDifficulty.label}</Pill>
          )}
          {scores.length >= 1 && !summary && (
            <Button
              variant="soft"
              size="sm"
              onClick={() => setSummary(true)}
            >
              Finish & reflect
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={reset}>
            Change scenario
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Active chat area — intentionally NOT dimmable. */}
        <Card className="flex flex-col gap-4 p-0 sm:p-0">
          <div className="border-b border-border px-5 py-4 sm:px-6">
            <p className="text-sm leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">The setup: </span>
              {scenario.setup}
            </p>
          </div>

          <div
            ref={scrollRef}
            className="flex max-h-[52vh] min-h-[240px] flex-col gap-3 overflow-y-auto px-5 py-4 sm:px-6"
          >
            {messages.length === 0 && !loading && (
              <p className="m-auto max-w-sm text-center text-sm text-ink-faint">
                Say hello when you&apos;re ready. Take all the time you need.
              </p>
            )}
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role}>
                {m.content}
              </ChatBubble>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3">
                  <ThinkingDots />
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-ink-soft">
                <p>That message didn&apos;t go through. No worries — take a
                  breath and try again.</p>
                <Button
                  variant="soft"
                  size="sm"
                  className="mt-2"
                  onClick={retry}
                >
                  Try again
                </Button>
              </div>
            )}
          </div>

          {messages.length === 0 && !loading && scenarioId && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 pt-4 sm:px-6">
              <span className="text-xs text-ink-faint">Not sure how to start?</span>
              {(STARTERS[scenarioId] ?? []).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setInput(s);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-brand hover:text-brand"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-border px-5 py-4 sm:px-6"
          >
            <label htmlFor="practice-input" className="sr-only">
              Your message
            </label>
            <input
              id="practice-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type what you'd say…"
              autoComplete="off"
              disabled={loading}
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:outline-none disabled:opacity-60"
            />
            <Button type="submit" disabled={loading || input.trim() === ""}>
              Send
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-3">
          {source === "fallback" && (
            <Pill tone="neutral" className="self-start">
              Demo mode
            </Pill>
          )}

          {summary && scores.length > 0 && (
            <Card
              role="status"
              aria-live="polite"
              className="flex flex-col gap-3 bg-brand-soft/40 animate-fade-up"
            >
              <SectionLabel>How that went</SectionLabel>
              <div className="flex items-end gap-2">
                <span className="font-display text-4xl leading-none text-brand">
                  {average(scores)}
                </span>
                <span className="pb-1 text-sm text-ink-faint">
                  / 100 avg confidence
                </span>
              </div>
              <p className="text-sm leading-relaxed text-ink">
                {encouragement(average(scores))}
              </p>
              <p className="text-xs text-ink-faint">
                {scores.length} {scores.length === 1 ? "reply" : "replies"}{" "}
                practised in this run.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => setSummary(false)}
                >
                  Keep going
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>
                  New scenario
                </Button>
              </div>
            </Card>
          )}

          <div role="status" aria-live="polite">
            <CoachPanel coach={coach} />
          </div>
        </div>
      </div>
    </div>
  );
}
