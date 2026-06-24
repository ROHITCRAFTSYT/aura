/**
 * Aura accessibility & sensory settings.
 *
 * Everything here is persisted to localStorage and applied to <html> via data-*
 * attributes (see SettingsProvider). Nothing leaves the device — privacy is a
 * first-class promise for this audience.
 */

export type Theme = "dawn" | "dusk" | "meadow";
export type Contrast = "normal" | "high";
export type FontScale = "sm" | "md" | "lg" | "xl";
export type Motion = "full" | "reduced";

export interface Settings {
  theme: Theme;
  contrast: Contrast;
  fontScale: FontScale;
  readable: boolean; // dyslexia-friendly spacing
  motion: Motion;
  focusMode: boolean;
  onboarded: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dawn",
  contrast: "normal",
  fontScale: "md",
  readable: false,
  motion: "full",
  focusMode: false,
  onboarded: false,
};

export const STORAGE_KEY = "aura.settings.v1";

export const THEME_OPTIONS: { value: Theme; label: string; hint: string; swatch: string }[] = [
  { value: "dawn", label: "Dawn", hint: "Warm & soft", swatch: "#f7f4ef" },
  { value: "dusk", label: "Dusk", hint: "Dim & cool", swatch: "#20242c" },
  { value: "meadow", label: "Meadow", hint: "Calm green", swatch: "#eef4ec" },
];

export const FONT_SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
];

/** Read settings safely (handles SSR + malformed storage). */
export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* storage full / blocked — settings just won't persist, app still works */
  }
}

/** Apply settings to the document root so CSS variables react instantly. */
export function applySettings(settings: Settings): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.setAttribute("data-theme", settings.theme);
  el.setAttribute("data-contrast", settings.contrast === "high" ? "high" : "normal");
  el.setAttribute("data-fontscale", settings.fontScale);
  el.setAttribute("data-readable", String(settings.readable));
  el.setAttribute("data-motion", settings.motion === "reduced" ? "reduced" : "full");
  el.setAttribute("data-focus", String(settings.focusMode));
}
