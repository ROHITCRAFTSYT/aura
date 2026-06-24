import type { CheckinEntry } from "@/components/checkin/storage";

/**
 * A tiny, calm sparkline of recent moods (1–5) so progress is visible at a
 * glance. Pure SVG, no dependencies, computed entirely on-device.
 */
export function MoodTrend({ entries }: { entries: CheckinEntry[] }) {
  // Oldest → newest, last 14.
  const points = [...entries]
    .sort((a, b) => a.ts - b.ts)
    .slice(-14)
    .map((e) => e.mood);

  if (points.length < 2) return null;

  const W = 260;
  const H = 64;
  const pad = 8;
  const stepX = (W - pad * 2) / (points.length - 1);
  const y = (m: number) => H - pad - ((m - 1) / 4) * (H - pad * 2);
  const coords = points.map((m, i) => [pad + i * stepX, y(m)] as const);
  const line = coords.map(([x, yy]) => `${x},${yy}`).join(" ");
  const area = `${pad},${H - pad} ${line} ${pad + (points.length - 1) * stepX},${H - pad}`;

  const avg = points.reduce((s, m) => s + m, 0) / points.length;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-3">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="max-w-full"
        role="img"
        aria-label={`Mood trend over your last ${points.length} check-ins, averaging ${avg.toFixed(1)} out of 5.`}
      >
        <polygon points={area} fill="rgb(var(--brand) / 0.10)" />
        <polyline
          points={line}
          fill="none"
          stroke="rgb(var(--brand))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map(([x, yy], i) => (
          <circle
            key={i}
            cx={x}
            cy={yy}
            r={i === coords.length - 1 ? 4 : 2.5}
            fill="rgb(var(--brand))"
          />
        ))}
      </svg>
      <div className="shrink-0">
        <span className="font-display block text-2xl text-ink">
          {avg.toFixed(1)}
        </span>
        <span className="block text-xs text-ink-faint">avg mood</span>
      </div>
    </div>
  );
}
