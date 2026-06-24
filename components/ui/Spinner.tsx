import { cn } from "@/lib/cn";

/** Calm "thinking" indicator — three gently pulsing dots, motion-safe. */
export function ThinkingDots({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      role="status"
      aria-label="Aura is thinking"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-brand animate-breathe"
          style={{ animationDelay: `${i * 0.25}s` }}
        />
      ))}
    </span>
  );
}
