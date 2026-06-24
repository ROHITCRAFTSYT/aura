"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Pill, SectionLabel } from "@/components/ui/Card";
import { ThinkingDots } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import type {
  ChatResponse,
  CheckinResult,
  ResponseSource,
} from "@/lib/types";
import {
  clearCheckins,
  loadCheckins,
  saveCheckins,
  streakDays,
  type CheckinEntry,
} from "@/components/checkin/storage";

const MOODS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "😞", label: "Really low" },
  { value: 2, emoji: "🙁", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

const ENERGY: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "🔋", label: "Drained" },
  { value: 2, emoji: "🪫", label: "Low" },
  { value: 3, emoji: "⚖️", label: "Steady" },
  { value: 4, emoji: "✨", label: "Lively" },
  { value: 5, emoji: "⚡", label: "Buzzing" },
];

function moodEmoji(value: number): string {
  return MOODS.find((m) => m.value === value)?.emoji ?? "😐";
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function CheckinStudio() {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [source, setSource] = useState<ResponseSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [history, setHistory] = useState<CheckinEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load history on mount (client only).
  useEffect(() => {
    setHistory(loadCheckins());
    setHydrated(true);
  }, []);

  const recent = [...history].sort((a, b) => b.ts - a.ts).slice(0, 10);
  const streak = streakDays(history);

  async function checkIn() {
    if (mood === null || energy === null || loading) return;
    setLoading(true);
    setError(false);
    setResult(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "checkin",
          mood,
          energy,
          note: note.trim() || undefined,
        }),
      });
      const json = (await res.json()) as ChatResponse;
      if (json.mode !== "checkin") throw new Error("Unexpected response mode");
      setResult(json.data);
      setSource(json.source);

      // Persist this check-in on-device.
      const entry: CheckinEntry = {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now()),
        ts: Date.now(),
        mood,
        energy,
        note: note.trim(),
      };
      const next = [entry, ...history];
      setHistory(next);
      saveCheckins(next);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void checkIn();
  }

  function handleClearHistory() {
    clearCheckins();
    setHistory([]);
  }

  const canSubmit = mood !== null && energy !== null && !loading;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <header className="flex flex-col gap-2">
        <SectionLabel>Calm Check-in</SectionLabel>
        <h1 className="font-display text-2xl font-medium text-ink sm:text-3xl">
          How are you, right now?
        </h1>
        <p className="max-w-2xl text-ink-soft">
          A small moment to notice how you feel. There&apos;s no right answer —
          just tap what fits.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-ink">
            How&apos;s your mood?
          </legend>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => {
              const active = mood === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  aria-pressed={active}
                  aria-label={m.label}
                  className={cn(
                    "flex min-w-[64px] flex-col items-center gap-1 rounded-2xl border px-3 py-3 transition-all focus-visible:outline-none",
                    active
                      ? "border-brand bg-brand-soft shadow-soft"
                      : "border-border bg-surface hover:border-brand",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {m.emoji}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      active ? "text-brand" : "text-ink-faint",
                    )}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-ink">
            And your energy?
          </legend>
          <div className="flex flex-wrap gap-2">
            {ENERGY.map((m) => {
              const active = energy === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setEnergy(m.value)}
                  aria-pressed={active}
                  aria-label={m.label}
                  className={cn(
                    "flex min-w-[64px] flex-col items-center gap-1 rounded-2xl border px-3 py-3 transition-all focus-visible:outline-none",
                    active
                      ? "border-brand bg-brand-soft shadow-soft"
                      : "border-border bg-surface hover:border-brand",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {m.emoji}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      active ? "text-brand" : "text-ink-faint",
                    )}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor="checkin-note" className="text-sm font-medium text-ink">
            Anything on your mind?{" "}
            <span className="font-normal text-ink-faint">(optional)</span>
          </label>
          <textarea
            id="checkin-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="A word, a sentence, or nothing at all…"
            className="w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-[0.95rem] leading-relaxed text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" disabled={!canSubmit}>
            {loading ? <ThinkingDots /> : "Check in"}
          </Button>
          {source === "fallback" && result && (
            <Pill tone="neutral">Demo mode</Pill>
          )}
        </div>
      </form>

      {error && (
        <Card className="flex flex-col gap-3 border-warn/30">
          <p className="text-sm leading-relaxed text-ink-soft">
            That didn&apos;t go through. Your feelings still count — take a
            breath and try again when you&apos;re ready.
          </p>
          <Button
            variant="soft"
            size="sm"
            className="self-start"
            onClick={() => void checkIn()}
          >
            Try again
          </Button>
        </Card>
      )}

      {result && !error && (
        <Card className="flex flex-col gap-5 bg-brand-soft/40 animate-fade-up">
          <div className="flex flex-col gap-2">
            <SectionLabel>Aura noticed</SectionLabel>
            <p className="text-[0.95rem] leading-relaxed text-ink">
              {result.reflection}
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl bg-surface px-4 py-3">
            <SectionLabel>A small thing to try</SectionLabel>
            <p className="text-[0.95rem] leading-relaxed text-ink">
              {result.grounding}
            </p>
          </div>
        </Card>
      )}

      {/* History — secondary, dimmable in focus mode. */}
      {hydrated && history.length > 0 && (
        <section
          className="flex flex-col gap-3"
          data-dimmable="true"
          aria-label="Your check-in history"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionLabel>Your recent check-ins</SectionLabel>
            <div className="flex items-center gap-2">
              <Pill tone="calm">
                {streak} {streak === 1 ? "day" : "days"} checked in
              </Pill>
              <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                Clear history
              </Button>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {recent.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-2.5"
              >
                <span className="text-xl" aria-hidden="true">
                  {moodEmoji(entry.mood)}
                </span>
                <span className="text-sm text-ink">{formatDate(entry.ts)}</span>
                {entry.note && (
                  <span className="truncate text-sm text-ink-faint">
                    {entry.note}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <p className="text-xs text-ink-faint">
            🔒 All your check-ins stay on this device — nothing is ever uploaded.
          </p>
        </section>
      )}

      {hydrated && history.length === 0 && (
        <p className="text-xs text-ink-faint">
          🔒 Check-ins are saved only on this device — never uploaded anywhere.
        </p>
      )}
    </div>
  );
}
