"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { cn } from "@/lib/cn";

const FEATURES = [
  {
    href: "/practice",
    no: "01",
    title: "Practice",
    lede: "Rehearse the moment before it happens.",
    blurb:
      "Order at a café, sit a job interview, join a group, make a phone call — with a partner who never rushes you. Gentle coaching and a confidence meter let you watch your own progress.",
    cta: "Start practicing",
    tone: "brand" as const,
  },
  {
    href: "/decode",
    no: "02",
    title: "Decode",
    lede: "Understand what they actually meant.",
    blurb:
      "Paste a confusing text, DM, or email — or just describe a situation. Aura explains the literal meaning, the likely tone, whether it's a joke or sarcasm, and a few kind ways you could reply.",
    cta: "Decode a message",
    tone: "accent" as const,
  },
  {
    href: "/checkin",
    no: "03",
    title: "Check-in",
    lede: "A quiet moment, just for you.",
    blurb:
      "A small mood log. Aura reflects back what it hears with warmth and offers one grounding tip. Your check-ins stay on your device — nobody else ever sees them.",
    cta: "Take a moment",
    tone: "calm" as const,
  },
];

const ACCESS = [
  { label: "Calm colour moods", hint: "Dawn · Dusk · Meadow" },
  { label: "Text size & spacing", hint: "Dyslexia-friendly option" },
  { label: "High contrast", hint: "Sharper to read" },
  { label: "Reduce motion", hint: "Fewer animations" },
  { label: "Focus mode", hint: "Dims the rest" },
  { label: "Stays on-device", hint: "Private by design" },
];

const toneDot: Record<string, string> = {
  brand: "bg-brand",
  accent: "bg-accent",
  calm: "bg-calm",
};

export default function HomePage() {
  return (
    <>
      <Onboarding />

      <div className="space-y-20 sm:space-y-28">
        {/* ===== Hero ===== */}
        <section className="grain relative overflow-hidden rounded-[1.6rem] border border-border bg-surface px-6 pb-14 pt-16 shadow-soft sm:px-12 sm:pb-20 sm:pt-24">
          <div
            className="aura-glow animate-aura pointer-events-none absolute left-1/2 top-[18%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="eyebrow mb-7 flex items-center justify-center gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-brand animate-breathe"
                  aria-hidden="true"
                />
                Aura · a companion for neurodiverse minds
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="font-display text-balance text-[2.6rem] font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl">
                A gentle place to practice
                <br className="hidden sm:block" />{" "}
                <em className="font-display italic text-brand">
                  being yourself
                </em>
                .
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl">
                Rehearse real conversations, make sense of confusing messages,
                and check in with how you feel — calmly, privately, at your own
                pace.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/practice">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Practice a conversation
                  </Button>
                </Link>
                <Link href="/decode">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Decode a message
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <p className="mt-7 text-sm text-ink-faint">
                No account. Works offline. Nothing leaves your device.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ===== Feature sections (editorial, numbered) ===== */}
        <Reveal>
          <section aria-labelledby="tools-heading">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Three calm tools</p>
                <h2
                  id="tools-heading"
                  className="font-display mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl"
                >
                  Pick whatever you need today
                </h2>
              </div>
              <p className="max-w-xs text-sm text-ink-faint">
                Each one stands alone. There&rsquo;s no order, no streak to keep,
                no pressure. Use what helps.
              </p>
            </div>

            <div className="border-t border-border">
              {FEATURES.map((f) => (
                <Link
                  key={f.href}
                  href={f.href}
                  className="group block border-b border-border focus-visible:outline-none"
                >
                  <div className="grid grid-cols-1 gap-3 py-8 transition-colors duration-300 group-hover:bg-surface/60 sm:grid-cols-[5rem_1fr_auto] sm:items-baseline sm:gap-8 sm:px-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn("h-2 w-2 rounded-full", toneDot[f.tone])}
                        aria-hidden="true"
                      />
                      <span className="font-display text-lg text-ink-faint">
                        {f.no}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                        {f.title}
                      </h3>
                      <p className="mt-1 text-[1.05rem] italic text-ink-soft">
                        {f.lede}
                      </p>
                      <p className="mt-3 max-w-2xl text-ink-soft">{f.blurb}</p>
                    </div>

                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand sm:mt-0 sm:self-center">
                      {f.cta}
                      <span
                        className="transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ===== Accessibility section ===== */}
        <Reveal>
          <section aria-labelledby="access-heading">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <p className="eyebrow">Built for how you actually feel</p>
                <h2
                  id="access-heading"
                  className="font-display mt-2 text-3xl font-medium tracking-tight text-ink sm:text-4xl"
                >
                  Shape Aura around your senses
                </h2>
                <p className="mt-5 text-ink-soft">
                  Bright screens, busy motion, and tiny text can make a hard day
                  harder. So almost everything here can be tuned. Open{" "}
                  <strong className="font-semibold text-ink">Settings</strong> in
                  the top bar to choose a calmer colour mood, larger text,
                  dyslexia-friendly spacing, high contrast, reduced motion, or a
                  focus mode that quietly dims everything but the task in front
                  of you.
                </p>
                <p className="mt-4 text-ink-soft">
                  Your settings and check-ins live only on this device. Privacy
                  is the default here, not a setting you have to go hunting for.
                </p>
              </div>

              <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-[1.1rem] border border-border bg-border sm:grid-cols-2">
                {ACCESS.map((a) => (
                  <li key={a.label} className="bg-surface p-5">
                    <span className="font-display block text-lg text-ink">
                      {a.label}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-faint">
                      {a.hint}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>
      </div>
    </>
  );
}
