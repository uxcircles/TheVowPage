"use client";

import { useState } from "react";
import { MomentsStylePicker } from "@/components/ui/MomentsStylePicker";
import { FORM_ID } from "@/components/dashboard/WeddingEditForm";
import { useSetDirty } from "@/components/dashboard/WeddingChrome";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { draftEditorCopy } from "@/lib/i18n/dictionaries/dashboard";

// Renders inside the "婚紗相簿（Moments）" EditorCard, alongside photo
// upload, rather than inside <WeddingEditForm>'s <form> - its hidden input
// submits into that form via the HTML `form` attribute instead, which also
// means WeddingEditForm's own delegated input listener never sees this
// change, so it marks dirty itself (see useSetDirty's doc comment).
export function MomentsStyleField({ defaultValue }: { defaultValue: string }) {
  const locale = useLocale();
  const [momentsStyle, setMomentsStyle] = useState(defaultValue);
  const setDirty = useSetDirty();

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{draftEditorCopy.momentsStyleLabel[locale]}</p>
      <input type="hidden" name="momentsStyle" value={momentsStyle} form={FORM_ID} />
      <MomentsStylePicker
        value={momentsStyle}
        onChange={(v) => {
          setMomentsStyle(v);
          setDirty(true);
        }}
      />
    </div>
  );
}
