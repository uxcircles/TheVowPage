/** Uploads a wedding photo via XHR (not a Server Action) specifically to get
 * real upload-progress events - Next.js Server Actions have no supported way
 * to observe browser upload progress, since the framework's own fetch call
 * wraps the request. Posts to app/api/photos/upload/route.ts, which does the
 * same auth/ownership/DB-bookkeeping work uploadWeddingPhoto used to do as a
 * Server Action. */
export function uploadPhotoWithProgress(
  weddingId: string,
  kind: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<{ error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/photos/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve({});
        return;
      }
      let message = "照片上傳失敗，請稍後再試。";
      try {
        const body = JSON.parse(xhr.responseText) as { error?: string };
        if (body.error) message = body.error;
      } catch {
        // non-JSON error body - fall back to the generic message above
      }
      resolve({ error: message });
    };
    xhr.onerror = () => resolve({ error: "照片上傳失敗，請稍後再試。" });

    const formData = new FormData();
    formData.set("weddingId", weddingId);
    formData.set("kind", kind);
    formData.set("file", file);
    xhr.send(formData);
  });
}
