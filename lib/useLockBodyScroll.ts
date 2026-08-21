"use client";

import { useEffect } from "react";

// Both AuthModal and ConfirmDialog render as a fixed inset-0 overlay, but a
// fixed-position overlay does nothing to stop the page underneath it from
// scrolling (via touch drag on mobile, or wheel/keyboard on desktop) - it
// has to be blocked explicitly. Restores whatever overflow value body had
// before (rather than assuming "") so nesting this under another scroll
// lock, however unlikely, can't clobber it.
export function useLockBodyScroll() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
}
