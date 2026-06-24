import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/components/SettingsProvider";
import { AppShell } from "@/components/AppShell";
import { STORAGE_KEY } from "@/lib/settings";

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Editorial display serif — warm, characterful, soft optical sizing.
const fraunces = Fraunces({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aura-seven-livid.vercel.app"),
  title: {
    default: "Aura — a gentle place to practice being yourself",
    template: "%s · Aura",
  },
  description:
    "Aura helps autistic and neurodiverse young people practice real-world conversations, decode confusing messages, and check in with themselves — in a calm, private, sensory-friendly space.",
  applicationName: "Aura",
  keywords: [
    "autism",
    "neurodiversity",
    "social skills",
    "accessibility",
    "mental health",
    "youth",
  ],
  openGraph: {
    title: "Aura — a gentle place to practice being yourself",
    description:
      "Practice conversations, decode confusing messages, and check in with how you feel — calm, private, on your own pace.",
    siteName: "Aura",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura — a gentle place to practice being yourself",
    description:
      "An AI companion for autistic & neurodiverse youth. Calm, private, on-device.",
  },
};

export const viewport: Viewport = {
  themeColor: "#5c7ca0",
  width: "device-width",
  initialScale: 1,
};

/**
 * Runs before paint to apply saved sensory settings, preventing a flash of the
 * default theme. Mirrors applySettings() in lib/settings.ts.
 */
const noFlashScript = `
(function() {
  try {
    var raw = localStorage.getItem('${STORAGE_KEY}');
    var s = raw ? JSON.parse(raw) : {};
    var el = document.documentElement;
    el.setAttribute('data-theme', s.theme || 'dawn');
    el.setAttribute('data-contrast', s.contrast === 'high' ? 'high' : 'normal');
    el.setAttribute('data-fontscale', s.fontScale || 'md');
    el.setAttribute('data-readable', String(!!s.readable));
    el.setAttribute('data-motion', s.motion === 'reduced' ? 'reduced' : 'full');
    el.setAttribute('data-focus', String(!!s.focusMode));
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body
        className={`${atkinson.variable} ${inter.variable} ${fraunces.variable}`}
      >
        <SettingsProvider>
          <AppShell>{children}</AppShell>
        </SettingsProvider>
      </body>
    </html>
  );
}
