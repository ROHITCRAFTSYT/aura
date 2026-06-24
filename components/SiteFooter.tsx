/**
 * Global footer shown on every page. Carries the cause, the privacy promise,
 * and — importantly for a wellbeing tool — real, calm support resources.
 * Aura is a practice space, not a crisis service, and says so plainly.
 */
const LINES = [
  { region: "US", text: "call or text 988 (Suicide & Crisis Lifeline)" },
  { region: "UK & ROI", text: "call 116 123 (Samaritans)" },
  {
    region: "Anywhere",
    text: "find a free, confidential line at findahelpline.com",
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border pt-10 sm:mt-28">
      {/* Support resources */}
      <section
        aria-label="Support resources"
        className="aura-card mb-10 bg-surface-2 p-6 sm:p-7"
      >
        <p className="font-display text-lg text-ink">
          If things feel heavy, you don&rsquo;t have to carry it alone.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Aura is a calm space to practice — not a crisis service. If
          you&rsquo;re in distress or thinking about harming yourself, please
          reach out to someone now, or tell a trusted adult.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {LINES.map((l) => (
            <li
              key={l.region}
              className="rounded-xl border border-border bg-surface px-4 py-3"
            >
              <span className="block text-xs font-semibold uppercase tracking-wider text-ink-faint">
                {l.region}
              </span>
              <span className="mt-0.5 block text-sm text-ink">{l.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cause + privacy */}
      <div className="flex flex-col items-center gap-3 pb-10 text-center">
        <span
          className="relative grid h-6 w-6 place-items-center"
          aria-hidden="true"
        >
          <span className="absolute inset-0 rounded-full bg-brand/20 animate-breathe" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-brand" />
        </span>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink-soft">
          Built for the{" "}
          <span className="font-semibold text-ink">Youth Code x AI</span>{" "}
          hackathon — Track 3, AI That Actually Helps People — whose proceeds
          support the{" "}
          <span className="font-semibold text-ink">Akhil Autism Foundation</span>
          .
        </p>
        <p className="text-xs text-ink-faint">
          Your conversations, check-ins, and settings stay on your device.
          Powered by Claude, with gentle fallback responses when offline.
        </p>
      </div>
    </footer>
  );
}
