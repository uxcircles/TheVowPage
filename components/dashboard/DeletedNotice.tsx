"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { deletedNoticeCopy } from "@/lib/i18n/dictionaries/dashboard";

// Reads the `?deleted=1` param deleteWedding() redirects here with -
// isolated in its own component (matches login's OAuthErrorNotice) so
// useSearchParams's Suspense requirement doesn't force the whole page out
// of static rendering.
export function DeletedNotice() {
  const searchParams = useSearchParams();
  const showToast = useToast();
  const locale = useLocale();
  useEffect(() => {
    if (searchParams.get("deleted") !== "1") return;
    showToast(deletedNoticeCopy.deleted[locale], "success");
    window.history.replaceState(null, "", window.location.pathname);
  }, [searchParams, showToast, locale]);
  return null;
}
