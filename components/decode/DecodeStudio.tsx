"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Pill, SectionLabel } from "@/components/ui/Card";
import { ThinkingDots } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { postChat } from "@/lib/chatClient";
import type { DecodeResult, ResponseSource } from "@/lib/types";

interface Example {
  label: string;
  text: string;
}

const EXAMPLES: Example[] = [
  {
    label: "A sarcastic text",
    text: "Oh wow, you're SO on time today. Truly amazing.",
  },
  {
    label: 'An ambiguous "k."',
    text: "k.",
  },
  {
    label: "A vague invite",
    text: "we should hang out sometime!! lol",
  },
];

export function DecodeStudio() {
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [source, setSource] = useState<ResponseSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const textRef = useRef<HTMLTextAreaElement>(null);

  function prefill(example: Example) {
    setText(example.text);
    setResult(null);
    setError(false);
    textRef.current?.focus();
  }

  async function decode() {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(false);
    try {
      const json = await postChat({
        mode: "decode",
        text: trimmed,
        context: context.trim() || undefined,
      });
      if (json.mode !== "decode") throw new Error("Unexpected response mode");
      setResult(json.data);
      setSource(json.source);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void decode();
  }

  const canSubmit = text.trim() !== "" && !loading;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <header className="flex flex-col gap-2">
        <SectionLabel>Decode</SectionLabel>
        <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">
          What did they really mean?
        </h1>
        <p className="max-w-2xl text-ink-soft">
          Paste a confusing text, DM, or email — or describe a social moment.
          Aura will gently unpack the literal meaning, the likely tone, and a
          few calm ways you could reply.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="decode-text"
            className="text-sm font-medium text-ink"
          >
            The message or situation
          </label>
          <textarea
            id="decode-text"
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Paste what they said, or describe what happened…"
            className="w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-[0.95rem] leading-relaxed text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="decode-context"
            className="text-sm font-medium text-ink"
          >
            Any context?{" "}
            <span className="font-normal text-ink-faint">(optional)</span>
          </label>
          <input
            id="decode-context"
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. it's my manager, or we had an argument yesterday"
            autoComplete="off"
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={!canSubmit}>
            {loading ? <ThinkingDots /> : "Decode it"}
          </Button>
          {source === "fallback" && result && (
            <Pill tone="neutral">Demo mode</Pill>
          )}
        </div>
      </form>

      {/* Example chips — secondary, dimmable in focus mode. */}
      <section
        className="flex flex-col gap-2"
        data-dimmable="true"
        aria-label="Example messages to try"
      >
        <SectionLabel>Not sure? Try one of these</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => prefill(ex)}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink-soft transition-all hover:border-brand hover:text-brand focus-visible:outline-none"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <Card className="flex flex-col gap-3 border-warn/30">
          <p className="text-sm leading-relaxed text-ink-soft">
            That didn&apos;t go through. No worries — take a breath and try
            again when you&apos;re ready.
          </p>
          <Button
            variant="soft"
            size="sm"
            className="self-start"
            onClick={() => void decode()}
          >
            Try again
          </Button>
        </Card>
      )}

      {result && !error && <DecodeResultCard result={result} />}
    </div>
  );
}

function DecodeResultCard({ result }: { result: DecodeResult }) {
  return (
    <Card
      role="status"
      aria-live="polite"
      className="flex flex-col gap-6 animate-fade-up"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="brand">{result.vibe}</Pill>
        {result.notLiteral && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warn/15 px-3 py-1 text-xs font-medium text-warn">
            <span aria-hidden="true">💬</span>
            Might be a joke / not literal
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>What it literally says</SectionLabel>
        <p className="text-[0.95rem] leading-relaxed text-ink">
          {result.literal}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <SectionLabel>Likely tone / what they might feel</SectionLabel>
        <p className="text-[0.95rem] leading-relaxed text-ink">
          {result.tone}
        </p>
      </div>

      {result.replies.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionLabel>Ways you could reply</SectionLabel>
          <ul className="flex flex-col gap-3">
            {result.replies.map((reply, i) => (
              <li
                key={i}
                className={cn(
                  "rounded-2xl bg-surface-2 px-4 py-3 text-[0.95rem] leading-relaxed text-ink",
                )}
              >
                {reply}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-faint">
            You don&apos;t have to use any of these — they&apos;re just options.
          </p>
        </div>
      )}
    </Card>
  );
}
