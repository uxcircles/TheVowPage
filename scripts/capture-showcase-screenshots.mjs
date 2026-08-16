// Regenerates public/showcase/demo-{theme}.webp - the real screenshots used
// on the homepage Showcase cards instead of the abstract InvitationCardVisual
// mockup. Re-run this whenever the demo weddings' photos or content change,
// so the cards don't go stale relative to the actual live pages.
//
// Not a project dependency (avoids bloating the app's own node_modules for a
// one-off asset-generation tool) - run against a local dev server:
//
//   npm install --no-save playwright
//   brew install webp  (for cwebp - only needed once)
//   npm run dev  (in another terminal, must be serving on localhost:3100)
//   node scripts/capture-showcase-screenshots.mjs

import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { unlinkSync } from "node:fs";

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "showcase");
const DEMOS = ["demo-gold", "demo-rose", "demo-blue"];
const SITE_URL = process.env.CAPTURE_SITE_URL ?? "http://localhost:3100";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 480, height: 600 } });

for (const slug of DEMOS) {
  await page.goto(`${SITE_URL}/w/${slug}`, { waitUntil: "networkidle" });
  const seal = await page.$(".wax-seal");
  if (seal) {
    await seal.click();
    await page.waitForTimeout(1200); // envelope-open + reveal transition
  }
  // Hide the floating "套用此設計" CTA so it doesn't get baked into the
  // static showcase image - that button only makes sense on the live page.
  await page.addStyleTag({ content: ".fixed { display: none !important; }" });
  // Playwright can't screenshot straight to webp, so capture as jpeg first
  // and immediately convert - this keeps the script's own output the final
  // .webp the app actually serves, rather than leaving a manual conversion
  // step for whoever reruns it.
  const jpegPath = path.join(OUT_DIR, `${slug}.jpg`);
  const webpPath = path.join(OUT_DIR, `${slug}.webp`);
  await page.screenshot({ path: jpegPath, type: "jpeg", quality: 88 });
  execFileSync("cwebp", ["-q", "85", jpegPath, "-o", webpPath]);
  unlinkSync(jpegPath);
  console.log(`saved ${webpPath}`);
}

await browser.close();
