// Wedding photos straight off a phone are routinely 10-20MB. Uploading that
// raw is slow for the couple, slow for guests loading the published page,
// and eats into Supabase Storage for no visual benefit at the sizes this
// site actually displays photos at. This resizes to a sane max dimension
// and re-encodes as WebP entirely client-side (Canvas API, no dependency)
// before the file ever hits the network.

const MAX_DIMENSION = 2560; // long edge, in the "2-4K" range requested -
// comfortably more detail than any layout in this app displays a photo at.
const WEBP_QUALITY = 0.82;
const SKIP_BELOW_BYTES = 1.5 * 1024 * 1024; // already-small files aren't
// worth the recompression-artifact risk and CPU cost.

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= SKIP_BELOW_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Some formats createImageBitmap can't decode (e.g. certain HEIC
    // variants in browsers without native HEIC support) - fall back to
    // uploading the original rather than failing the whole upload.
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
  if (!blob) return file;

  // A handful of source files (already-optimized JPEGs, screenshots) don't
  // actually shrink from a WebP re-encode - keep whichever is smaller
  // rather than trusting the conversion blindly.
  if (blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], newName, { type: "image/webp" });
}
