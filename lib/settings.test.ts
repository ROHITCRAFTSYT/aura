import { describe, it, expect } from "vitest";
import { resolveSettings, systemPatchFrom, DEFAULT_SETTINGS } from "./settings";

describe("systemPatchFrom", () => {
  it("maps reduced motion and more contrast", () => {
    expect(systemPatchFrom(true, true)).toEqual({ motion: "reduced", contrast: "high" });
  });

  it("is empty when neither preference is requested", () => {
    expect(systemPatchFrom(false, false)).toEqual({});
  });

  it("maps only motion when only reduced motion is set", () => {
    expect(systemPatchFrom(true, false)).toEqual({ motion: "reduced" });
  });
});

describe("resolveSettings", () => {
  it("seeds from the OS patch on first run (no stored value)", () => {
    expect(resolveSettings(null, { motion: "reduced" })).toEqual({
      ...DEFAULT_SETTINGS,
      motion: "reduced",
    });
  });

  it("lets an explicit stored choice win over defaults and the OS", () => {
    const stored = JSON.stringify({ motion: "full", theme: "dusk" });
    const s = resolveSettings(stored, { motion: "reduced" });
    expect(s.motion).toBe("full"); // user chose full even though OS asked for reduced
    expect(s.theme).toBe("dusk");
  });

  it("fills unspecified fields from defaults", () => {
    const s = resolveSettings(JSON.stringify({ theme: "meadow" }), {});
    expect(s.theme).toBe("meadow");
    expect(s.fontScale).toBe(DEFAULT_SETTINGS.fontScale);
  });

  it("falls back to defaults on malformed storage", () => {
    expect(resolveSettings("{bad json", {})).toEqual(DEFAULT_SETTINGS);
  });
});
