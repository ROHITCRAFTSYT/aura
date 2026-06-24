# Aura

*A gentle space to practice talking, understand confusing messages, and check in with yourself.*

## Inspiration

A lot of social tech is loud. It rewards speed, streaks, and constant back-and-forth — the exact things that can make social situations exhausting for autistic and neurodiverse people. We kept hearing the same wish from friends and family on the spectrum: not "make me more social," but "give me a safe place to figure things out before I'm put on the spot."

So we built that place. The three hardest parts of everyday socializing kept coming up: *getting through a real conversation*, *knowing what a message actually means*, and *noticing how you feel before it builds up*. Aura is one calm tool for each.

This is a hackathon project for **Youth Code x AI** (Track 3: AI That Actually Helps People), and the event's proceeds support the **Akhil Autism Foundation** — so building genuinely *for* the autism community, not just about it, mattered to us from the first commit.

## What it does

Aura has three small tools, each designed to take the pressure out of a real moment.

- **Practice** lets you rehearse real scenarios — ordering at a café, a job interview, joining a group, a phone call, a disagreement — with a patient AI partner that never rushes you. If you freeze on the first line, tap a **starter phrase** to begin. Gentle, specific coaching and a confidence meter fill in as you go, and a warm **end-of-session reflection** shows your average confidence — progress you can see, without ever being scored or judged.
- **Decode** takes a confusing text, DM, or email (or a situation you describe) and explains it: the literal meaning, the likely tone, whether it's sarcasm or a joke, and a few kind ways you could reply. It's the friend you text to ask "wait, what did they mean by this?"
- **Check-in** is a quick, quiet mood log. Aura reflects back what it hears with warmth and gives you one small grounding tip — and draws a small **mood-trend sparkline** from your past check-ins so you can notice patterns over time. All of it stays private, on your device.

Wrapping all of it is a **sensory settings panel** so the app itself never becomes the stressor — and a calm, ever-present footer of real support helplines, because a wellbeing tool has a duty of care.

## How we built it

- **Next.js 14 (App Router) + TypeScript (strict) + Tailwind CSS** for a fast, typed, themeable front end.
- **Claude** (via the `@anthropic-ai/sdk`) powers the roleplay, the message decoding, and the check-in reflections through a single API route, with carefully written system prompts for each tool's tone.
- **Bring your own AI, any provider.** You can connect Anthropic, OpenAI, Google Gemini, OpenRouter, Groq, Mistral, DeepSeek, or any OpenAI-compatible endpoint with your own key. The key is stored only on your device and is used purely to relay your request to the provider you picked.
- **On-device privacy by design.** Check-ins, every setting, and any AI key live in the browser's local storage. There are no accounts, no database, and no analytics, so nothing personal ever leaves the device.
- **Graceful offline fallback.** With no key or no network, each feature returns curated responses that actually read what you typed and reply in character, instead of an error. The app stays calm and usable in a demo room, on a school network, or on a phone with no signal.
- **A token-driven theme system.** All colors are CSS variables; the settings panel just flips `data-*` attributes on `<html>`, so themes, contrast, and font scale switch instantly with no flash and no re-render.
- **A crafted, calm visual identity.** A warm paper-ivory canvas, the Fraunces editorial serif paired with Atkinson Hyperlegible, a signature "breathing aura" motif, and a custom social-share card — distinctive without ever becoming overstimulating.

## Accessibility & inclusive design

This is the part we're proudest of. Accessibility isn't a settings sub-menu we bolted on — it shaped every screen.

- **Three calm color moods**: Dawn (warm), Dusk (dim and cool for light sensitivity), Meadow (soft green).
- **Atkinson Hyperlegible** typeface everywhere, plus a dyslexia-friendly spacing toggle.
- **Adjustable text size**, **high-contrast mode**, and **reduce motion** (which also honors the OS `prefers-reduced-motion` setting).
- **Focus mode** that gently dims everything except the task you're on.
- **Keyboard-first and screen-reader aware**: semantic HTML, real buttons and links, a skip-to-content link, generous visible focus rings, and `aria-live` regions so a screen reader hears each AI response as it arrives.
- **A duty of care**: every page ends with calm, real helplines (988 in the US, Samaritans in the UK/ROI, findahelpline.com worldwide) and a clear note that Aura is a practice space, not a crisis service.
- **No dark patterns**: the onboarding is short, optional, and skippable. Nothing traps you, nothing nags you, and there's no scoring or streak to chase.

## Social impact

Roughly 1 in 36 young people is autistic, and social and communication situations are a daily source of anxiety for many of them. Aura doesn't try to change who someone is — it gives them a private, judgment-free way to prepare, understand, and self-regulate on their own terms. That's squarely the goal of Track 3: technology that actually helps a real group of people. And because the hackathon supports the **Akhil Autism Foundation**, the project ties directly back to organizations doing this work every day.

## Challenges we ran into

- **Tone is everything.** For this audience, a reply that's slightly too clinical, too cheerful, or too vague can do harm. We spent real time on the prompts and the fallback copy to keep Aura warm, plain-spoken, and honest without being patronizing.
- **Making the theme system instant and flash-free.** Reading saved settings before first paint (so the screen never flickers from a default theme) took a small inline script and a disciplined "every color is a token" rule.
- **Designing calm that's still distinctive.** Calm UIs can drift into bland. We leaned on soft gradients, a single breathing accent, and generous whitespace to feel intentional rather than empty.

## What's next

- More Practice scenarios, including user-written ones, plus optional spoken practice with speech input and output.
- An opt-in encrypted export so Check-in history can move between a user's own devices without ever touching a server.
- Localized helplines that adapt to the user's region automatically.
- A review pass with autistic young people and educators to keep the language right.

## Demo video script (~2 minutes)

**[0:00–0:15] — Open on the landing page.**
"This is Aura, a calm companion for autistic and neurodiverse young people. Three tools: Practice a conversation, Decode a confusing message, and Check in with yourself. No account, and everything stays on your device."

**[0:15–0:35] — Set sensory preferences.**
Click **Settings** in the top bar. Switch the color mood from Dawn to **Dusk**, bump the **text size** up, and toggle **Reduce motion**. The whole app restyles instantly. "Aura bends to your senses, not the other way around — calmer colors, bigger text, less motion, all on by choice."

**[0:35–1:05] — Run a Practice scenario.**
Open **Practice**, choose the **café** scenario. Tap a **starter phrase** to show how it removes the "how do I begin?" hurdle, then send a message or two. The AI partner responds warmly and in character while the **coaching panel and confidence meter** fill in. Hit **Finish & reflect** to reveal the gentle end-of-session summary. "A patient partner that never rushes you, a nudge when you're stuck, and a warm reflection at the end — no scores, no judgment."

**[1:05–1:30] — Decode a sarcastic text.**
Open **Decode**, paste: *"Oh great, another Monday. Can't wait."* Aura returns the literal meaning, flags it as **sarcasm**, reads the tone as tired and joking, and suggests a couple of relaxed replies. "It's the friend you text to ask: wait, what did they actually mean?"

**[1:30–1:50] — Do a Check-in.**
Open **Check-in**, pick a mood, add a sentence. Aura reflects it back kindly and offers one small grounding tip — and the **mood-trend sparkline** appears beneath your history. "A quick, private way to notice how you feel, and to see patterns over time — kept only on your device."

**[1:50–2:00] — Close on care, privacy, and impact.**
Scroll to the footer with its real support helplines. "Aura is private by design, works even offline, looks after the people who use it, and was built for the Youth Code x AI hackathon supporting the Akhil Autism Foundation. A gentle space — for whatever you need today."
