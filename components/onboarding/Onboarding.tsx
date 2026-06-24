"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Card";
import { useSettings } from "@/components/SettingsProvider";
import {
  FONT_SCALE_OPTIONS,
  THEME_OPTIONS,
  type FontScale,
  type Theme,
} from "@/lib/settings";
import { cn } from "@/lib/cn";

/**
 * A gentle, fully skippable first-run welcome.
 *
 * Shows only after settings have hydrated (`ready`) and when the user hasn't
 * been onboarded yet. Completing OR skipping both set `onboarded: true`, so the
 * user is never trapped. Step 2 reuses the real settings system, so any choice
 * here is the same choice they'd make in the Settings panel.
 */

type Step = 0 | 1 | 2;

export function Onboarding() {
  const { settings, update, ready } = useSettings();
  const [step, setStep] = useState<Step>(0);
  // Local "mounted" guard so the overlay only ever appears client-side.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll while the welcome is open.
  const open = mounted && ready && !settings.onboarded;
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const reduced = settings.motion === "reduced";
  const finish = () => update({ onboarded: true });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* Backdrop — soft, not harsh black */}
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface shadow-lift",
          !reduced && "animate-fade-up",
        )}
      >
        {/* Calm gradient header band with a breathing mark */}
        <div className="relative bg-gradient-to-b from-brand-soft to-surface px-6 pb-5 pt-7 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2.5">
              <span className="relative grid h-9 w-9 place-items-center">
                <span
                  className={cn(
                    "absolute inset-0 rounded-full bg-brand/25",
                    !reduced && "animate-breathe",
                  )}
                />
                <span className="relative h-4 w-4 rounded-full bg-brand" />
              </span>
              <span className="text-lg font-bold tracking-tight text-ink">
                Aura
              </span>
            </span>
            <button
              type="button"
              onClick={finish}
              className="rounded-xl px-2.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2"
            >
              Skip for now
            </button>
          </div>
        </div>

        <div className="px-6 pb-7 pt-2 sm:px-8">
          {/* Step dots */}
          <div className="mb-5 flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-brand" : "w-1.5 bg-border",
                )}
              />
            ))}
          </div>

          {step === 0 && <StepWelcome />}
          {step === 1 && <StepComfort />}
          {step === 2 && <StepReady />}

          {/* Footer controls */}
          <div className="mt-7 flex items-center justify-between gap-3">
            <span className="text-sm text-ink-faint">
              Step {step + 1} of 3
            </span>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setStep((s) => (s - 1) as Step)}
                >
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setStep((s) => (s + 1) as Step)}
                >
                  Continue
                </Button>
              ) : (
                <Button variant="primary" size="md" onClick={finish}>
                  Begin
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function StepWelcome() {
    return (
      <div>
        <SectionLabel>Welcome</SectionLabel>
        <h2
          id="onboarding-title"
          className="mt-2 text-2xl font-bold tracking-tight text-ink"
        >
          Hi, this is your quiet corner.
        </h2>
        <p className="mt-3 text-ink-soft">
          Aura is a calm place to rehearse conversations, make sense of
          confusing messages, and check in with how you feel. There is no
          scoring, no streaks, and no pressure — you can take everything at your
          own pace.
        </p>
        <p className="mt-3 text-ink-soft">
          Everything you write stays on your device. It is just for you.
        </p>
      </div>
    );
  }

  function StepComfort() {
    return (
      <div>
        <SectionLabel>Make it comfortable</SectionLabel>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
          Set the mood that suits you.
        </h2>
        <p className="mt-3 text-ink-soft">
          Pick what feels easy on your eyes. You can change any of this anytime
          from the Settings button in the top bar.
        </p>

        {/* Color mood */}
        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-semibold text-ink">
            Color mood
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => {
              const active = settings.theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ theme: opt.value as Theme })}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-all",
                    active
                      ? "border-brand bg-brand-soft"
                      : "border-border bg-surface hover:border-brand/50",
                  )}
                >
                  <span
                    className="h-6 w-6 rounded-full border border-border"
                    style={{ backgroundColor: opt.swatch }}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-ink-faint">
                      {opt.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Text size */}
        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-semibold text-ink">
            Text size
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {FONT_SCALE_OPTIONS.map((opt) => {
              const active = settings.fontScale === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ fontScale: opt.value as FontScale })}
                  aria-pressed={active}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-sm font-medium transition-all",
                    active
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-surface text-ink-soft hover:border-brand/50",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Reduce motion */}
        <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
          <span>
            <span className="block text-sm font-semibold text-ink">
              Reduce motion
            </span>
            <span className="block text-xs text-ink-faint">
              Calms gentle animations and the breathing accent.
            </span>
          </span>
          <input
            type="checkbox"
            checked={settings.motion === "reduced"}
            onChange={(e) =>
              update({ motion: e.target.checked ? "reduced" : "full" })
            }
            className="h-5 w-5 shrink-0 accent-brand"
          />
        </label>
      </div>
    );
  }

  function StepReady() {
    return (
      <div>
        <SectionLabel>All set</SectionLabel>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
          You&rsquo;re ready.
        </h2>
        <p className="mt-3 text-ink-soft">
          Start wherever feels right. Try <strong>Practice</strong> to rehearse
          a conversation, <strong>Decode</strong> to understand a message, or{" "}
          <strong>Check-in</strong> to notice how you&rsquo;re feeling.
        </p>
        <p className="mt-3 text-ink-soft">
          Take a slow breath. There&rsquo;s no wrong way to use this.
        </p>
      </div>
    );
  }
}
