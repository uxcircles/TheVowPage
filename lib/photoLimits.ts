// Shared between client components (pre-upload validation, so a bad file
// never even starts a request) and app/api/photos/upload/route.ts (the
// authoritative check - client validation alone can always be bypassed).

export const MAX_PHOTO_SIZE_BYTES = 8 * 1024 * 1024; // 8MB - safely under
// next.config.ts's 10mb request-body cap, leaving room for the rest of the
// multipart request instead of relying on that hard cutoff (which fails
// with a generic error, not a clear "too large" message).

export const MAX_MOMENT_PHOTOS = 30;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

export function validatePhotoType(file: { type: string }): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "檔案格式不支援，請上傳 JPG、PNG、WEBP 或 HEIC 圖片。";
  }
  return null;
}

export function validatePhotoSize(file: { size: number }): string | null {
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return "檔案大小不能超過 8MB。";
  }
  return null;
}

// Combined check - used server-side (route.ts) where there's no
// client-side compression step to shrink the file first, so both need
// checking up front on whatever the browser actually sent.
export function validatePhotoFile(file: { type: string; size: number }): string | null {
  return validatePhotoType(file) ?? validatePhotoSize(file);
}
