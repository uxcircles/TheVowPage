import { TermsPageContent } from "@/components/legal/TermsPageContent";
import { termsMeta } from "@/lib/i18n/dictionaries/legal";

export const metadata = { title: termsMeta.metaTitle.zh };

export default function TermsPage() {
  return <TermsPageContent locale="zh" />;
}
