"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

// Which field is "primary" - rendered on top, and the one left visible
// alone when bilingual is off - follows the admin's own dashboard locale
// rather than always assuming Chinese. An English-locale admin (this
// product's UK market too, not just Taiwan) types their real content into
// the EN field first and expects that to stay visible and on top; a
// Chinese-locale admin gets the original zh-first behavior. The
// underlying save mapping (zh -> groomName, en -> contentEn.groomName)
// never changes - this only decides which one the *editor* treats as
// primary. Each row carries an explicit key ("zh"/"en") independent of
// which position it renders in, so a locale change that swaps their order
// makes React move each input's DOM node to its new slot instead of
// reusing the *other* language's node in that slot - which would leave a
// now-EN-named input still showing the old zh text, since defaultValue on
// an uncontrolled input only applies at actual mount.
export function BilingualField({
  label,
  bilingual,
  zhInput,
  enInput,
  className = "",
}: {
  label?: ReactNode;
  bilingual: boolean;
  zhInput: ReactNode;
  enInput: ReactNode;
  className?: string;
}) {
  const locale = useLocale();
  const zhFirst = locale !== "en";

  return (
    <div className={`flex flex-col gap-1.5 text-sm text-[var(--brand-ink-soft)] ${className}`}>
      {label && <span>{label}</span>}
      {zhFirst ? (
        <>
          <LangRow key="zh" tag="中" tagHidden={!bilingual}>
            {zhInput}
          </LangRow>
          <LangRow key="en" tag="EN" rowHidden={!bilingual}>
            {enInput}
          </LangRow>
        </>
      ) : (
        <>
          <LangRow key="en" tag="EN" tagHidden={!bilingual}>
            {enInput}
          </LangRow>
          <LangRow key="zh" tag="中" rowHidden={!bilingual}>
            {zhInput}
          </LangRow>
        </>
      )}
    </div>
  );
}

// items-stretch (rather than a fixed height on the pill) is what keeps the
// pill exactly as tall as its field, including for compound rows (parents
// name + relation word) where the "field" is itself a flex row of two
// inputs - the pill just stretches to match whatever that row ends up
// being. Zero gap plus rounded-l/rounded-r-none on the touching edges (via
// the `:first-child` selector, which reaches into a compound row's own
// first input) fuses the pill and field into one visual control instead of
// two boxes floating apart.
//
// The content wrapper is a plain block div, not a flex container, so a
// bare <input>/<textarea> dropped straight into it (every simple field -
// name, label, venue, dress code, thanks message) reverts to the
// browser's own intrinsic form-control size instead of filling the row,
// unless something forces it to. [&>input]:w-full/[&>textarea]:w-full
// covers width; [&>textarea]:h-full covers height specifically for
// textareas, whose `rows` attribute gives them a shorter intrinsic
// height than the row (driven by the pill's own height) stretches the
// wrapper to - without it the pill's border ran a few pixels past the
// visibly-shorter textarea's own bottom border, looking unattached.
// (A plain <input> doesn't need the same h-full: its intrinsic height
// already matches the pill's.) Both are scoped to *direct* children only
// (`>`, not a descendant selector) so they never reach into a compound
// row's own inner flex div and fight that row's own w-20/flex-1 sizing.
function LangRow({
  tag,
  children,
  rowHidden = false,
  tagHidden = false,
}: {
  tag: string;
  children: ReactNode;
  rowHidden?: boolean;
  tagHidden?: boolean;
}) {
  return (
    <div className={rowHidden ? "hidden" : "flex items-stretch"}>
      <span
        className={
          tagHidden
            ? "hidden"
            : "flex w-10 shrink-0 items-center justify-center rounded-l border border-r-0 border-[var(--brand-line)] bg-[var(--background)] text-[10px] font-medium tracking-wide text-[var(--brand-ink-soft)]"
        }
      >
        {tag}
      </span>
      <div
        className={
          tagHidden
            ? "min-w-0 flex-1 [&>input]:w-full [&>textarea]:w-full [&>textarea]:h-full"
            : "min-w-0 flex-1 [&_input:first-child]:rounded-l-none [&_textarea:first-child]:rounded-l-none [&>input]:w-full [&>textarea]:w-full [&>textarea]:h-full"
        }
      >
        {children}
      </div>
    </div>
  );
}
