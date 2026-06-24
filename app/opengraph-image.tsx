import { ImageResponse } from "next/og";

// Edge runtime: avoids Node file-path resolution (which breaks on Windows paths
// with spaces) and is the canonical environment for ImageResponse.
export const runtime = "edge";

export const alt =
  "Aura — a gentle place to practice being yourself. For autistic and neurodiverse youth.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share card. Warm paper canvas + clay accent, matching the app.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#F4F1E9",
          color: "#26221C",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: "#C16546",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 30, color: "#968D81", letterSpacing: 2 }}>
            AURA
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.05,
              maxWidth: 920,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            A gentle place to practice being yourself.
          </div>
          <div style={{ fontSize: 32, color: "#635B50", maxWidth: 880, display: "flex" }}>
            Practice conversations, decode confusing messages, and check in with
            how you feel — calm, private, on your own pace.
          </div>
        </div>

        <div style={{ fontSize: 24, color: "#968D81", display: "flex" }}>
          An AI companion for autistic &amp; neurodiverse youth · on-device &amp;
          private
        </div>
      </div>
    ),
    { ...size },
  );
}
