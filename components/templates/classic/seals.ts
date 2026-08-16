import type { ClassicThemeId } from "./themes";

export type SealDesignId = "calla" | "rose" | "forget-me-not" | "hydrangea";

export type SealDesign = {
  id: SealDesignId;
  name: { zh: string; en: string };
  image: string;
  // Some themes have a dedicated re-shot of the seal (not a CSS recolor -
  // that flattened the emboss detail into a flat blob, see classic.css
  // history) - fall back to the default gold image when a theme has none.
  imageByTheme?: Partial<Record<ClassicThemeId, string>>;
};

export const SEAL_DESIGNS: SealDesign[] = [
  {
    id: "calla",
    name: { zh: "海芋", en: "Calla Lily" },
    image: "/templates/classic/wax-seal.webp",
    imageByTheme: {
      rose: "/templates/classic/wax-seal-calla-pink.webp",
      blue: "/templates/classic/wax-seal-calla-blue.webp",
    },
  },
  {
    id: "rose",
    name: { zh: "玫瑰", en: "Rose" },
    image: "/templates/classic/wax-seal-rose.webp",
    imageByTheme: {
      rose: "/templates/classic/wax-seal-rose-pink.webp",
      blue: "/templates/classic/wax-seal-rose-blue.webp",
    },
  },
  {
    id: "forget-me-not",
    name: { zh: "勿忘我", en: "Forget-Me-Not" },
    image: "/templates/classic/wax-seal-forget-me-not.webp",
    imageByTheme: {
      rose: "/templates/classic/wax-seal-forget-me-not-pink.webp",
      blue: "/templates/classic/wax-seal-forget-me-not-blue.webp",
    },
  },
  {
    id: "hydrangea",
    name: { zh: "繡球花", en: "Hydrangea" },
    image: "/templates/classic/wax-seal-hydrangea.webp",
    imageByTheme: {
      rose: "/templates/classic/wax-seal-hydrangea-pink.webp",
      blue: "/templates/classic/wax-seal-hydrangea-blue.webp",
    },
  },
];

export const DEFAULT_SEAL_ID: SealDesignId = "calla";

export function getSealDesign(id: string | null | undefined): SealDesign {
  return SEAL_DESIGNS.find((s) => s.id === id) ?? SEAL_DESIGNS[0];
}

export function getSealImage(seal: SealDesign, themeId: ClassicThemeId): string {
  return seal.imageByTheme?.[themeId] ?? seal.image;
}
