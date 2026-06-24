"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, SectionLabel, Pill } from "@/components/ui/Card";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { cn } from "@/lib/cn";

const FEATURES = [
  {
    href: "/practice",
    emoji: "💬",
    title: "Practice",
    blurb:
      "Rehearse real moments — ordering at a café, a job interview, joining a group, a phone call — with a patient partner who never rushes you. Gentle coaching and a confidence meter help you see your own progress.",
    cta: "Start practicing",
    tone: "brand" as const,
  },
  {
    href: "/decode",
    emoji: "🔍",
    title: "Decode",
    blurb:
      "Paste a confusing text, DM, or email — or just describe a situation. Aura explains what it literally means, the likely tone, whether it's a joke or sarcasm, and a few kind ways you could reply.",
    cta: "Decode a message",
    tone: "accent" as const,
  },
  {
    href: "/checkin",
    emoji: "🌤️",
    title: "Check-in",
    blurb:
      "A quick, quiet mood log. Aura reflects back what it hears with warmth and offers one small grounding tip. Your check-ins stay private, on your device — nobody else sees them.",
    cta: "Take a moment",
    tone: "calm" as const,
  },
];

const ACCESS = [
  { emoji: "🎨", label: "Calm color moods", hint: "Dawn, Dusk, or Meadow" },
  { emoji: "🔠", label: "Text size & spacing", hint: "Dyslexia-friendly option" },
  { emoji: "🌗", label: "High contrast", hint: "Easier to read" },
  { emoji: "🍃", label: "Reduce motion", hint: "Fewer animations" },
  { emoji: "🎯", label: "Focus mode", hint: "Dims the rest" },
  { emoji: "🔒", label: "Stays on-device", hint: "Private by design" },
];

export default function HomePage() {
  return (
    <>
      <Onboarding />

      <div className="space-y-16 sm:space-y-24">
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-brand-soft/60 via-surface to-surface px-6 py-12 shadow-soft sm:px-12 sm:py-16">
          {/* Soft floating accents */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-calm/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <Pill tone="brand" className="mb-5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-brand animate-breathe"
                aria-hidden="true"
              />
              A gentle social companion
            </Pill>

            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Meet{" "}
              <span className="relative whitespace-nowrap text-brand">
                Aura
                <span
                  className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-brand/15"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-ink-soft sm:text-xl">
              A gentle space to practice talking, understand confusing messages,
              and check in with yourself.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/practice">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  💬 Practice a conversation
                </Button>
              </Link>
              <Link href="/decode">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  🔍 Decode a message
                </Button>
              </Link>
              <Link href="/checkin">
                <Button variant="soft" size="lg" className="w-full sm:w-auto">
                  🌤️ Check in
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-ink-faint">
              No account needed. Works offline. Nothing leaves your device.
            </p>
          </div>
        </section>

        {/* ===== Feature cards ===== */}
        <section aria-labelledby="tools-heading">
          <div className="mb-8 text-center">
            <SectionLabel className="justify-center">Three calm tools</SectionLabel>
            <h2
              id="tools-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
            >
              Pick whatever you need today
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group block focus-visible:outline-none"
              >
                <Card className="flex h-full flex-col transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lift group-focus-visible:-translate-y-1 group-focus-visible:shadow-lift">
                  <div
                    className={cn(
                      "grid h-12 w-12 place-items-center rounded-2xl text-2xl",
                      f.tone === "brand" && "bg-brand-soft",
                      f.tone === "accent" && "bg-accent/15",
                      f.tone === "calm" && "bg-calm/15",
                    )}
                    aria-hidden="true"
                  >
                    {f.emoji}
                  </div>
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-2 flex-1 text-ink-soft">{f.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    {f.cta}
                    <span
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== Accessibility section ===== */}
        <section aria-labelledby="access-heading">
          <Card className="overflow-hidden bg-gradient-to-br from-surface to-surface-2 p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <SectionLabel>Built for how you actually feel</SectionLabel>
                <h2
                  id="access-heading"
                  className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
                >
                  Shape Aura around your senses
                </h2>
                <p className="mt-4 text-ink-soft">
                  Bright screens, busy motion, and tiny text can make a hard day
                  harder. So Aura lets you tune almost everything. Open the{" "}
                  <strong className="text-ink">Settings</strong> button in the
                  top bar to choose a calmer color mood, larger text, dyslexia
                  -friendly spacing, high contrast, reduced motion, or a focus
                  mode that quietly dims everything but the task in front of you.
                </p>
                <p className="mt-4 text-ink-soft">
                  Your settings and check-ins live only on this device. We think
                  privacy should be the default, not a setting you have to find.
                </p>
              </div>

              <ul className="grid grid-cols-2 gap-3" role="list">
                {ACCESS.map((a) => (
                  <li
                    key={a.label}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
                  >
                    <span className="text-xl" aria-hidden="true">
                      {a.emoji}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {a.label}
                      </span>
                      <span className="block text-xs text-ink-faint">
                        {a.hint}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </section>

        {/* ===== Footer / cause note ===== */}
        <footer className="border-t border-border pt-8 text-center">
          <p className="mx-auto max-w-2xl text-sm text-ink-soft">
            Aura was built for the{" "}
            <span className="font-semibold text-ink">Youth Code x AI</span>{" "}
            hackathon (Track 3: AI That Actually Helps People), whose proceeds
            support the{" "}
            <span className="font-semibold text-ink">
              Akhil Autism Foundation
            </span>
            .
          </p>
          <p className="mt-3 text-xs text-ink-faint">
            🔒 Your conversations, check-ins, and settings stay on your device.
            Powered by Claude, with gentle fallback responses when offline.
          </p>
        </footer>
      </div>
    </>
  );
}
