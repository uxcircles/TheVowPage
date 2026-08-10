export type MomentsStyleId = "stack" | "grid" | "carousel";

export type MomentsStyle = {
  id: MomentsStyleId;
  name: string;
  tagline: string;
};

export const MOMENTS_STYLES: MomentsStyle[] = [
  { id: "stack", name: "堆疊動畫", tagline: "拍立得堆疊，適合少量精選照片" },
  { id: "grid", name: "相片牆", tagline: "格狀牆面，適合較多張照片" },
  { id: "carousel", name: "3D 輪播", tagline: "立體卡片，可滑動切換" },
];

export const DEFAULT_MOMENTS_STYLE_ID: MomentsStyleId = "stack";

export function getMomentsStyle(id: string | null | undefined): MomentsStyle {
  return MOMENTS_STYLES.find((s) => s.id === id) ?? MOMENTS_STYLES[0];
}
