export type ClassicThemeId = "gold" | "rose" | "blue";

export type ClassicTheme = {
  id: ClassicThemeId;
  name: { zh: string; en: string };
  tagline: { zh: string; en: string };
  cream: string;
  creamDeep: string;
  ink: string;
  inkSoft: string;
  gold: string;
  line: string;
  // Comma-separated "r, g, b" (no rgba() wrapper) so classic.css can plug it
  // into rgba(var(--envelope-shadow-rgb), <alpha>) at different opacities
  // for the envelope/wax-seal drop-shadows.
  envelopeShadowRgb: string;
};

// These map directly onto the CSS custom properties defined at the .classic
// root in classic.css (--cream, --cream-deep, --ink, --ink-soft, --gold,
// --line) - the entire template's color identity is built on those six
// variables, so overriding them per-wedding re-themes everything at once.
export const CLASSIC_THEMES: ClassicTheme[] = [
  {
    id: "gold",
    name: { zh: "經典金", en: "Classic Gold" },
    tagline: { zh: "溫潤米金，百搭經典", en: "Warm gold tones, timelessly versatile" },
    cream: "#f8f3e9",
    creamDeep: "#f1e9da",
    ink: "#3c352c",
    inkSoft: "#6b6156",
    gold: "#a3835a",
    line: "#ddd1ba",
    envelopeShadowRgb: "107, 67, 33",
  },
  {
    id: "rose",
    name: { zh: "霧粉玫瑰", en: "Dusty Rose" },
    tagline: { zh: "柔霧粉調，浪漫細膩", en: "Soft, dusty pink with romantic detail" },
    cream: "#faf1ee",
    creamDeep: "#f2ddd8",
    ink: "#4a3330",
    inkSoft: "#8a6a63",
    gold: "#c07f77",
    line: "#e8cfc9",
    envelopeShadowRgb: "138, 74, 74",
  },
  {
    id: "blue",
    name: { zh: "晨霧灰藍", en: "Misty Blue" },
    tagline: { zh: "灰藍靜謐，優雅清新", en: "Calm blue-grey, elegant and fresh" },
    cream: "#eef3f4",
    creamDeep: "#dbe7ea",
    ink: "#2d3f45",
    inkSoft: "#62787d",
    gold: "#6f97a3",
    line: "#c3d8dc",
    envelopeShadowRgb: "61, 83, 90",
  },
];

export const DEFAULT_CLASSIC_THEME_ID: ClassicThemeId = "gold";

export function getClassicTheme(id: string | null | undefined): ClassicTheme {
  return CLASSIC_THEMES.find((t) => t.id === id) ?? CLASSIC_THEMES[0];
}

type EnvelopeImages = { bottom: string; flap: string };

const DEFAULT_ENVELOPE_IMAGES: EnvelopeImages = {
  bottom: "/templates/classic/envelope-bottom.webp",
  flap: "/templates/classic/envelope-flap.webp",
};

// Only themes with dedicated pre-rendered envelope art appear here; every
// other theme falls back to the default gold-toned envelope images.
const ENVELOPE_IMAGES_BY_THEME: Partial<Record<ClassicThemeId, EnvelopeImages>> = {
  rose: {
    bottom: "/templates/classic/envelope-bottom-pink.webp",
    flap: "/templates/classic/envelope-flap-pink.webp",
  },
  blue: {
    bottom: "/templates/classic/envelope-bottom-blue.webp",
    flap: "/templates/classic/envelope-flap-blue.webp",
  },
};

export function getEnvelopeImages(themeId: ClassicThemeId): EnvelopeImages {
  return ENVELOPE_IMAGES_BY_THEME[themeId] ?? DEFAULT_ENVELOPE_IMAGES;
}
