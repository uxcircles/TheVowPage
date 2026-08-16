export type MomentsStyleId = "stack" | "grid" | "carousel";

export type MomentsStyle = {
  id: MomentsStyleId;
  name: { zh: string; en: string };
  tagline: { zh: string; en: string };
};

export const MOMENTS_STYLES: MomentsStyle[] = [
  {
    id: "stack",
    name: { zh: "堆疊動畫", en: "Stacked animation" },
    tagline: { zh: "拍立得堆疊，適合少量精選照片", en: "Polaroid-style stack, best for a small curated set" },
  },
  {
    id: "grid",
    name: { zh: "相片牆", en: "Photo wall" },
    tagline: { zh: "格狀牆面，適合較多張照片", en: "Grid layout, best for a larger number of photos" },
  },
  {
    id: "carousel",
    name: { zh: "3D 輪播", en: "3D carousel" },
    tagline: { zh: "立體卡片，可滑動切換", en: "Layered cards you can swipe through" },
  },
];

export const DEFAULT_MOMENTS_STYLE_ID: MomentsStyleId = "stack";

export function getMomentsStyle(id: string | null | undefined): MomentsStyle {
  return MOMENTS_STYLES.find((s) => s.id === id) ?? MOMENTS_STYLES[0];
}
