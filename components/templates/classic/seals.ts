import type { ClassicThemeId } from "./themes";

export type SealDesignId = "calla" | "rose" | "forget-me-not" | "hydrangea";

export type SealDesign = {
  id: SealDesignId;
  name: string;
  image: string;
  // Some themes have a dedicated re-shot of the seal (not a CSS recolor -
  // that flattened the emboss detail into a flat blob, see classic.css
  // history) - fall back to the default gold image when a theme has none.
  imageByTheme?: Partial<Record<ClassicThemeId, string>>;
};

export const SEAL_DESIGNS: SealDesign[] = [
  {
    id: "calla",
    name: "海芋",
    image: "/templates/classic/wax-seal.png",
    imageByTheme: { rose: "/templates/classic/wax-seal-calla-pink.png" },
  },
  {
    id: "rose",
    name: "玫瑰",
    image: "/templates/classic/wax-seal-rose.png",
    imageByTheme: { rose: "/templates/classic/wax-seal-rose-pink.png" },
  },
  {
    id: "forget-me-not",
    name: "勿忘我",
    image: "/templates/classic/wax-seal-forget-me-not.png",
    imageByTheme: { rose: "/templates/classic/wax-seal-forget-me-not-pink.png" },
  },
  {
    id: "hydrangea",
    name: "繡球花",
    image: "/templates/classic/wax-seal-hydrangea.png",
    imageByTheme: { rose: "/templates/classic/wax-seal-hydrangea-pink.png" },
  },
];

export const DEFAULT_SEAL_ID: SealDesignId = "calla";

export function getSealDesign(id: string | null | undefined): SealDesign {
  return SEAL_DESIGNS.find((s) => s.id === id) ?? SEAL_DESIGNS[0];
}

export function getSealImage(seal: SealDesign, themeId: ClassicThemeId): string {
  return seal.imageByTheme?.[themeId] ?? seal.image;
}
