"use client";

import { useState } from "react";
import { MomentsStylePicker } from "@/components/ui/MomentsStylePicker";
import { FORM_ID } from "@/components/dashboard/WeddingEditForm";

// Renders inside the "婚紗相簿（Moments）" EditorCard, alongside photo
// upload, rather than inside <WeddingEditForm>'s <form> - its hidden input
// submits into that form via the HTML `form` attribute instead.
export function MomentsStyleField({ defaultValue }: { defaultValue: string }) {
  const [momentsStyle, setMomentsStyle] = useState(defaultValue);

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">婚紗相簿呈現方式</p>
      <input type="hidden" name="momentsStyle" value={momentsStyle} form={FORM_ID} />
      <MomentsStylePicker value={momentsStyle} onChange={setMomentsStyle} />
    </div>
  );
}
