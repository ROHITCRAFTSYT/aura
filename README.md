# Aura

**A gentle space to practice talking, understand confusing messages, and check in with yourself.**

Aura is a calm, sensory-friendly social companion for autistic and neurodiverse young people (ages 13+). It turns everyday social situations into something you can rehearse, decode, and reflect on at your own pace — privately, on your own device.

Built for the **Youth Code x AI** hackathon (Track 3: *AI That Actually Helps People*), whose proceeds support the **Akhil Autism Foundation**.

🌐 **Live demo:** https://aura-seven-livid.vercel.app

---

## What it does

Aura has three small tools, each designed to lower the pressure of a real moment:

- **💬 Practice** — Rehearse real-world scenarios (a café order, a job interview, joining a group, a phone call, a disagreement) with a patient AI roleplay partner. Tap a **starter phrase** if you're not sure how to begin, get gentle, specific coaching and a confidence meter as you go, and end with a warm **session reflection** showing your average confidence — never a grade or a judgement.
- **🔍 Decode** — Paste a confusing message, DM, or email, or just describe a situation. Aura explains the literal meaning, the likely tone, whether something is sarcasm or a joke, and suggests a few kind ways you could reply.
- **🌤️ Check-in** — A quick, quiet mood log. Aura reflects back what it hears with warmth and offers one small grounding tip. Check-ins are kept privately on-device.

## Accessibility & privacy

Accessibility is a first-class feature, not an afterthought. A **sensory settings panel** (the Settings button in the top bar) lets anyone tune:

- Calm color **themes** — Dawn (warm), Dusk (dim & cool), Meadow (soft green)
- **Text size** and dyslexia-friendly **spacing**
- **High contrast** mode
- **Reduce motion** (also respects your OS `prefers-reduced-motion`)
- **Focus mode** that dims everything except the task in front of you

Typography uses **Atkinson Hyperlegible** for body text (it stays readable even in dyslexia-friendly mode), paired with the **Fraunces** editorial serif for a warm, distinctive feel. Beyond the settings panel, Aura ships with deeper accessibility care: a **skip-to-content** link, **`aria-live` announcements** so screen readers hear AI responses as they arrive, semantic landmarks, and large, keyboard-friendly targets.

**A duty of care.** Aura is a practice space, not a crisis service — and it says so. Every page carries a calm footer with real, free helplines (988 in the US, Samaritans in the UK/ROI, and findahelpline.com worldwide) and a nudge to reach a trusted adult.

**Privacy is a core promise.** All personal data — check-ins and settings — stays in your browser's local storage and never leaves your device. There are no accounts and no tracking. The Check-in tool even draws an on-device **mood trend sparkline** so progress is visible without anything being uploaded.

## Works offline

Aura is **powered by Claude**, but it works even without an API key. If `ANTHROPIC_API_KEY` is unset (or the network is unavailable), every AI feature falls back to curated, hand-written responses so the app never errors and the experience stays calm.

---

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS** — themeable via CSS variables + `data-*` attributes on `<html>`
- **Anthropic Claude** via `@anthropic-ai/sdk`

## Run it locally

Requires Node.js 18.17+.

```bash
# 1. Install dependencies
npm install

# 2. Add your environment file (optional — the app works without a key)
cp .env.example .env.local
#   then open .env.local and paste your key:
#   ANTHROPIC_API_KEY=sk-ant-...
#   Get one at https://console.anthropic.com/

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **No key? No problem.** Leave `ANTHROPIC_API_KEY` blank and Aura runs entirely on its built-in fallback responses — perfect for demos and offline use.

## Build for production

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects Next.js.
3. (Optional, for live Claude responses) add an environment variable in **Project → Settings → Environment Variables**:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
4. Deploy. That's it — Aura works with or without the key.

---

## Project structure

```
app/            App Router pages (home, /practice, /decode, /checkin) + API route
components/     UI kit, feature studios, settings + onboarding
  onboarding/   First-run welcome flow
  ui/           Button, Card, Spinner
lib/            settings, prompts, fallback responses, scenarios, types
```

---

Made with care for the autistic and neurodiverse community. 💙
