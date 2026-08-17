import localFont from "next/font/local";

// Self-hosted, hand-subsetted replacement for next/font/google's
// Chiron_Sung_HK. That font is CJK-native - Google Fonts only lets you
// *add* peripheral scripts (cyrillic/greek/latin/vietnamese/symbols2) to a
// CJK font via `subsets`, there's no way to opt out of its full Han
// character set. The result was ~46KB (compressed) of render-blocking CSS
// on every single page - 236 separate @font-face unicode-range rules
// covering the entire Traditional Chinese glyph set - just to render the
// couple of dozen fixed characters actually used with this font (the "The
// Vow Page 摯頁" wordmark, plus the marketing/legal page headings).
//
// This file was subset directly via Google Fonts' own CSS2 API (which
// supports arbitrary-text subsetting even though next/font's wrapper
// doesn't expose it) to exactly the characters those headings use, plus
// full Latin/digits/basic punctuation as headroom for future English copy
// edits. Weights 500 and 600 resolve to byte-identical font data from
// Google (this family apparently has no meaningfully distinct 500 vs 600
// master) - both requested weights below map to the one subset file.
//
// IMPORTANT: if a heading that uses headingFont ever gets *new* Chinese
// text (not just edited English copy), that new character needs adding to
// this subset or it will silently fall back to the browser's default
// serif font. To regenerate: collect every zh string ever rendered with
// headingFont.className (grep the codebase for `headingFont`), then fetch
// https://fonts.googleapis.com/css2?family=Chiron+Sung+HK:wght@500;600&text=<those characters, URL-encoded>
// and re-download the resulting woff2.
export const headingFont = localFont({
  src: [
    { path: "./fonts/chiron-sung-hk-subset.woff2", weight: "500", style: "normal" },
    { path: "./fonts/chiron-sung-hk-subset.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
});
