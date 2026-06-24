// Capture gallery-ready 3:2 screenshots of Aura for the Devpost submission.
// Run against a local server: node scripts/shots.mjs
import puppeteer from "puppeteer";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://localhost:3140";
const OUT = "shots";
mkdirSync(OUT, { recursive: true });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
// 1200x800 = 3:2; deviceScaleFactor 2 -> crisp 2400x1600 output.
await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

async function clickByText(selector, text) {
  const handles = await page.$$(selector);
  for (const h of handles) {
    const t = await page.evaluate((el) => el.textContent || "", h);
    if (t.includes(text)) {
      await h.click();
      return true;
    }
  }
  return false;
}

async function scrollTo(selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90 });
  }, selector);
}

// --- Seed localStorage: skip onboarding + a little check-in history ---
await page.goto(BASE, { waitUntil: "networkidle0" });
await page.evaluate(() => {
  localStorage.setItem(
    "aura.settings.v1",
    JSON.stringify({
      theme: "dawn",
      contrast: "normal",
      fontScale: "md",
      readable: false,
      motion: "full",
      focusMode: false,
      onboarded: true,
    }),
  );
  const now = Date.now();
  const day = 86400000;
  localStorage.setItem(
    "aura.checkins.v1",
    JSON.stringify([
      { id: "a", ts: now - 5 * day, mood: 2, energy: 2, note: "busy day" },
      { id: "b", ts: now - 4 * day, mood: 3, energy: 3, note: "" },
      { id: "c", ts: now - 3 * day, mood: 3, energy: 4, note: "felt okay" },
      { id: "d", ts: now - 2 * day, mood: 4, energy: 3, note: "good chat with a friend" },
      { id: "e", ts: now - 1 * day, mood: 4, energy: 4, note: "" },
    ]),
  );
});

// --- 1. Landing ---
await page.reload({ waitUntil: "networkidle0" });
await wait(1200);
await page.screenshot({ path: `${OUT}/01-landing.png` });
console.log("captured landing");

// --- 2. Settings drawer (on landing) ---
await page.click('button[aria-label="Open sensory and accessibility settings"]');
await wait(700);
await page.screenshot({ path: `${OUT}/02-settings.png` });
await page.keyboard.press("Escape");
await wait(500);
console.log("captured settings");

// --- 3. Practice: scenario picker ---
await page.goto(`${BASE}/practice`, { waitUntil: "networkidle0" });
await wait(1000);
await page.screenshot({ path: `${OUT}/03-practice-picker.png` });
console.log("captured practice picker");

// --- 4. Practice: a coached conversation ---
await clickByText("button", "Ordering at a café");
await page.waitForSelector("#practice-input", { timeout: 8000 });
await wait(400);
await page.type("#practice-input", "Hi, could I please get a hot chocolate?");
await page.keyboard.press("Enter");
await wait(4500); // wait for reply + coach
await page.evaluate(() => window.scrollTo({ top: 0 }));
await wait(300);
await page.screenshot({ path: `${OUT}/04-practice-chat.png` });
console.log("captured practice chat");

// --- 5. Decode: a sarcastic message ---
await page.goto(`${BASE}/decode`, { waitUntil: "networkidle0" });
await wait(800);
await page.type("textarea", "Oh great, another Monday. Can't wait.");
await clickByText("button", "Decode");
await wait(4000);
await scrollTo('[role="status"]');
await wait(400);
await page.screenshot({ path: `${OUT}/05-decode.png` });
console.log("captured decode");

// --- 6. Check-in: result + mood trend ---
await page.goto(`${BASE}/checkin`, { waitUntil: "networkidle0" });
await wait(800);
await page.click('button[aria-label="Good"]');
await page.click('button[aria-label="Steady"]');
await page.type("#checkin-note", "Felt a bit nervous but it went fine.");
await clickByText("button", "Check in");
await wait(4000);
await scrollTo('[role="status"]');
await wait(400);
await page.screenshot({ path: `${OUT}/06-checkin.png` });
// also a shot focused on the mood trend + history
await scrollTo("svg[role='img']");
await wait(400);
await page.screenshot({ path: `${OUT}/07-checkin-trend.png` });
console.log("captured checkin");

await browser.close();
console.log("done");
