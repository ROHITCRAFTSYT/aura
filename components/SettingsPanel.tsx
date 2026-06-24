"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/components/SettingsProvider";
import {
  FONT_SCALE_OPTIONS,
  THEME_OPTIONS,
  type FontScale,
} from "@/lib/settings";
import {
  PROVIDERS,
  getPreset,
  loadAiConfig,
  saveAiConfig,
  clearAiConfig,
  type AiProvider,
} from "@/lib/aiConfig";
import { Button } from "@/components/ui/Button";
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

  // Bring-your-own-key state (kept entirely on this device).
  const [aiProvider, setAiProvider] = useState<AiProvider>("anthropic");
  const [aiKey, setAiKey] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [aiBaseUrl, setAiBaseUrl] = useState("");
  const [connected, setConnected] = useState(false);
  const preset = getPreset(aiProvider);

  useEffect(() => {
    const c = loadAiConfig();
    if (c) {
      setAiProvider(c.provider);
      setAiKey(c.apiKey);
      setAiModel(c.model);
      setAiBaseUrl(c.baseUrl);
      setConnected(true);
    }
  }, []);

  function connectAi() {
    if (!aiKey.trim()) return;
    const p = getPreset(aiProvider);
    saveAiConfig({
      provider: aiProvider,
      apiKey: aiKey.trim(),
      model: aiModel.trim() || p.defaultModel,
      baseUrl: aiProvider === "custom" ? aiBaseUrl.trim() : p.baseUrl,
    });
    setConnected(true);
  }

  function removeAi() {
    clearAiConfig();
    setAiKey("");
    setConnected(false);
  }

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

        {/* Bring your own AI */}
        <section className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <div>
            <p className="text-sm font-semibold text-ink">
              Use your own AI{" "}
              <span className="font-normal text-ink-faint">(optional)</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              By default Aura uses built-in demo replies. Add a key from any
              provider for live, smarter answers. Your key is stored only on this
              device.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="ai-provider" className="sr-only">
              AI provider
            </label>
            <select
              id="ai-provider"
              value={aiProvider}
              onChange={(e) => {
                setAiProvider(e.target.value as AiProvider);
                setAiModel("");
              }}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink focus-visible:border-brand focus-visible:outline-none"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            {aiProvider === "custom" && (
              <input
                value={aiBaseUrl}
                onChange={(e) => setAiBaseUrl(e.target.value)}
                placeholder="Base URL, e.g. https://host/v1"
                autoComplete="off"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:outline-none"
              />
            )}

            <input
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              placeholder={
                preset.defaultModel
                  ? `Model (default: ${preset.defaultModel})`
                  : "Model name"
              }
              autoComplete="off"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:outline-none"
            />

            <label htmlFor="ai-key" className="sr-only">
              API key
            </label>
            <input
              id="ai-key"
              type="password"
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              placeholder={`API key ${preset.keyHint}`}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={connectAi}
              disabled={
                !aiKey.trim() || (aiProvider === "custom" && !aiBaseUrl.trim())
              }
            >
              {connected ? "Update" : "Connect"}
            </Button>
            {connected && (
              <Button size="sm" variant="ghost" onClick={removeAi}>
                Remove
              </Button>
            )}
            {preset.keysUrl && (
              <a
                href={preset.keysUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-brand underline underline-offset-2"
              >
                Get a key →
              </a>
            )}
          </div>

          <p className="text-xs">
            {connected ? (
              <span className="text-positive">
                ● Connected — live answers are on.
              </span>
            ) : (
              <span className="text-ink-faint">
                ○ Not connected — using calm demo replies.
              </span>
            )}
          </p>
        </section>

        <p className="mt-auto rounded-xl bg-surface-2 px-4 py-3 text-xs leading-relaxed text-ink-soft">
          🔒 Aura keeps your check-ins, settings, and any AI key on your own
          device. Nothing is saved to an account.
        </p>
      </aside>
    </div>
  );
}
