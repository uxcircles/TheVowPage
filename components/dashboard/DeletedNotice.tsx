"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

// Reads the `?deleted=1` param deleteWedding() redirects here with -
// isolated in its own component (matches login's OAuthErrorNotice) so
// useSearchParams's Suspense requirement doesn't force the whole page out
// of static rendering.
export function DeletedNotice() {
  const searchParams = useSearchParams();
  const showToast = useToast();
  useEffect(() => {
    if (searchParams.get("deleted") !== "1") return;
    showToast("已刪除", "success");
    window.history.replaceState(null, "", window.location.pathname);
  }, [searchParams, showToast]);
  return null;
}
