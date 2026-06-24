"use client";

import { useEffect } from "react";
import { useSettings } from "@/components/SettingsProvider";
import {
  FONT_SCALE_OPTIONS,
  THEME_OPTIONS,
  type FontScale,
} from "@/lib/settings";
import { cn } from "@/lib/cn";

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-brand"
    >
      <span>
        <span className="block font-medium text-ink">{label}</span>
        <span className="block text-sm text-ink-soft">{hint}</span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          on ? "bg-brand" : "bg-surface-2 border border-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { settings, update } = useSettings();

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-label="Sensory & accessibility settings"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col gap-6 overflow-y-auto bg-bg p-6 shadow-lift transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink">Make Aura yours</h2>
            <p className="text-sm text-ink-soft">
              Adjust how Aura looks and feels. Saved on this device only.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-full p-2 text-ink-soft hover:bg-surface-2"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Theme */}
        <section className="space-y-3">
          <p className="text-sm font-semibold text-ink">Colour mood</p>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => update({ theme: t.value })}
                className={cn(
                  "rounded-2xl border-2 p-3 text-center transition-all",
                  settings.theme === t.value
                    ? "border-brand shadow-soft"
                    : "border-border hover:border-ink-faint",
                )}
              >
                <span
                  className="mx-auto mb-2 block h-9 w-9 rounded-full border border-border"
                  style={{ background: t.swatch }}
                />
                <span className="block text-sm font-medium text-ink">
                  {t.label}
                </span>
                <span className="block text-xs text-ink-faint">{t.hint}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Text size */}
        <section className="space-y-3">
          <p className="text-sm font-semibold text-ink">Text size</p>
          <div className="grid grid-cols-4 gap-2">
            {FONT_SCALE_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => update({ fontScale: f.value as FontScale })}
                className={cn(
                  "rounded-xl border-2 py-2 text-sm font-medium transition-all",
                  settings.fontScale === f.value
                    ? "border-brand text-brand"
                    : "border-border text-ink-soft hover:border-ink-faint",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* Toggles */}
        <section className="space-y-3">
          <Toggle
            label="High contrast"
            hint="Stronger text and edges"
            on={settings.contrast === "high"}
            onChange={(v) => update({ contrast: v ? "high" : "normal" })}
          />
          <Toggle
            label="Easy-reading spacing"
            hint="More space between letters and words"
            on={settings.readable}
            onChange={(v) => update({ readable: v })}
          />
          <Toggle
            label="Reduce motion"
            hint="Calm things down — fewer animations"
            on={settings.motion === "reduced"}
            onChange={(v) => update({ motion: v ? "reduced" : "full" })}
          />
          <Toggle
            label="Focus mode"
            hint="Gently dim everything but the part you're using"
            on={settings.focusMode}
            onChange={(v) => update({ focusMode: v })}
          />
        </section>

        <p className="mt-auto rounded-xl bg-surface-2 px-4 py-3 text-xs leading-relaxed text-ink-soft">
          🔒 Aura keeps your check-ins and settings on your own device. Nothing
          is saved to an account.
        </p>
      </aside>
    </div>
  );
}
