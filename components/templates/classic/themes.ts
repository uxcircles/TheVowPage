export type ClassicThemeId = "gold" | "rose" | "ink";

export type ClassicTheme = {
  id: ClassicThemeId;
  name: string;
  tagline: string;
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
    name: "經典金",
    tagline: "溫潤米金，百搭經典",
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
    name: "霧粉玫瑰",
    tagline: "柔霧粉調，浪漫細膩",
    cream: "#faf1ee",
    creamDeep: "#f2ddd8",
    ink: "#4a3330",
    inkSoft: "#8a6a63",
    gold: "#c07f77",
    line: "#e8cfc9",
    envelopeShadowRgb: "138, 74, 74",
  },
  {
    id: "ink",
    name: "墨韻極簡",
    tagline: "深墨留白，低調高雅",
    cream: "#f4f4f2",
    creamDeep: "#e2e1dc",
    ink: "#25241f",
    inkSoft: "#5c5a53",
    gold: "#2f2e2b",
    line: "#d8d7d1",
    envelopeShadowRgb: "45, 43, 38",
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
};

export function getEnvelopeImages(themeId: ClassicThemeId): EnvelopeImages {
  return ENVELOPE_IMAGES_BY_THEME[themeId] ?? DEFAULT_ENVELOPE_IMAGES;
}
