import type { ReactNode } from "react";

// The ZH-HANT pill itself toggles hidden/visible with `bilingual` (so a
// non-bilingual wedding's form looks exactly like a plain single-language
// field, pill and all), but the row structure around zhInput never
// changes shape - only a sibling <span>'s own `hidden` class flips. That
// keeps zhInput's position in the tree constant across the toggle, so an
// *uncontrolled* input (defaultValue, as in WeddingEditForm) never
// remounts and loses whatever's been typed. The EN row uses the same
// "stay mounted, just hidden" trick for the same reason.
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
  return (
    <div className={`flex flex-col gap-1.5 text-sm text-[var(--brand-ink-soft)] ${className}`}>
      {label && <span>{label}</span>}
      <LangRow tag="ZH-HANT" tagHidden={!bilingual}>
        {zhInput}
      </LangRow>
      <LangRow tag="EN" rowHidden={!bilingual}>
        {enInput}
      </LangRow>
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
// browser's own intrinsic form-control width instead of filling the row,
// unless something forces it wide. [&>input]:w-full/[&>textarea]:w-full
// does that for a bare direct child; it's scoped to *direct* children only
// (`>`, not a descendant selector) so it never reaches into a compound
// row's own inner flex div and fights that row's own w-20/flex-1 sizing.
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
            : "flex w-16 shrink-0 items-center justify-center rounded-l border border-r-0 border-[var(--brand-line)] bg-[var(--background)] text-[10px] font-medium tracking-wide text-[var(--brand-ink-soft)]"
        }
      >
        {tag}
      </span>
      <div
        className={
          tagHidden
            ? "min-w-0 flex-1 [&>input]:w-full [&>textarea]:w-full"
            : "min-w-0 flex-1 [&_input:first-child]:rounded-l-none [&_textarea:first-child]:rounded-l-none [&>input]:w-full [&>textarea]:w-full"
        }
      >
        {children}
      </div>
    </div>
  );
}
