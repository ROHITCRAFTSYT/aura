import { Card, SectionLabel } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { PracticeReply } from "@/lib/types";

/** Maps a 0-100 score to a calm color token + a kind label. */
function meterTone(score: number): { bar: string; label: string } {
  if (score >= 70) return { bar: "bg-positive", label: "Lovely and warm" };
  if (score >= 40) return { bar: "bg-calm", label: "Coming along nicely" };
  return { bar: "bg-warn", label: "A gentle start" };
}

/**
 * Coach side panel: the latest note, an animated confidence meter, and one tip.
 * Wrapped with data-dimmable so the app's focus mode can gently dim it.
 */
export function CoachPanel({
  coach,
}: {
  coach: PracticeReply["coach"] | null;
}) {
  const score = coach ? Math.max(0, Math.min(100, Math.round(coach.score))) : 0;
  const tone = meterTone(score);

  return (
    <Card
      data-dimmable="true"
      className="flex flex-col gap-5 transition-opacity"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>Coach</SectionLabel>
        <span className="text-lg" aria-hidden="true">
          🌱
        </span>
      </div>

      {coach ? (
        <>
          <p className="text-[0.95rem] leading-relaxed text-ink">{coach.note}</p>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-ink-soft">
                Confidence
              </span>
              <span className="text-xs font-semibold text-ink-soft">
                {score}
                <span className="sr-only"> out of 100 — {tone.label}</span>
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2"
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Confidence meter"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700 ease-out",
                  tone.bar,
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-xs text-ink-faint">{tone.label}</p>
          </div>

          <div className="rounded-xl bg-brand-soft px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              Tip
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{coach.tip}</p>
          </div>
        </>
      ) : (
        <p className="text-sm leading-relaxed text-ink-soft">
          Send your first message and your coach will share a gentle note here —
          no pressure, no scores you can fail.
        </p>
      )}
    </Card>
  );
}
