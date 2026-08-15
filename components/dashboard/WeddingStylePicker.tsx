"use client";

import { useState } from "react";
import { ThemePicker } from "@/components/ui/ThemePicker";
import { SealPicker } from "@/components/ui/SealPicker";
import { FORM_ID } from "@/components/dashboard/WeddingEditForm";
import { useSetDirty } from "@/components/dashboard/WeddingChrome";

// Renders outside <WeddingEditForm>'s <form> (it lives in its own top-level
// EditorCard on the edit page), so its hidden inputs submit into that form
// via the HTML `form` attribute instead of DOM nesting - which also means
// WeddingEditForm's own delegated input listener never sees these changes,
// so this marks dirty itself instead (see useSetDirty's doc comment).
export function WeddingStylePicker({
  defaultTheme,
  defaultSeal,
}: {
  defaultTheme: string;
  defaultSeal: string;
}) {
  const [theme, setTheme] = useState(defaultTheme);
  const [sealDesign, setSealDesign] = useState(defaultSeal);
  const setDirty = useSetDirty();

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">顏色</p>
      <input type="hidden" name="theme" value={theme} form={FORM_ID} />
      <ThemePicker
        value={theme}
        onChange={(v) => {
          setTheme(v);
          setDirty(true);
        }}
      />
      <p className="mb-2 mt-6 text-sm font-medium text-foreground">封蠟花樣</p>
      <input type="hidden" name="seal" value={sealDesign} form={FORM_ID} />
      <SealPicker
        value={sealDesign}
        onChange={(v) => {
          setSealDesign(v);
          setDirty(true);
        }}
      />
    </div>
  );
}
