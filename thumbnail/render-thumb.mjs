// One-off: render aura-thumbnail.svg to a 1280x720 PNG for YouTube.
// Run from the project root: node thumbnail/render-thumb.mjs
import puppeteer from "puppeteer";
import { readFileSync } from "node:fs";
import path from "node:path";

const dir = path.resolve("thumbnail");
const svg = readFileSync(path.join(dir, "aura-thumbnail.svg"), "utf8");
const outPath = path.join(dir, "aura-thumbnail.png");

const html = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0}#c{width:1280px;height:720px}</style>
</head><body><div id="c">${svg}</div></body></html>`;

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 600));
const el = await page.$("#c");
await el.screenshot({ path: outPath });
await browser.close();
console.log("wrote", outPath);
