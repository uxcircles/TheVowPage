import { TermsPageContent } from "@/components/legal/TermsPageContent";
import { termsMeta } from "@/lib/i18n/dictionaries/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: termsMeta.metaTitle.en,
  description: "Terms of Service for The Vow Page's online wedding invitation platform: accounts, paid publishing, our refund guarantee, and content licensing.",
  path: "/en/terms",
  locale: "en",
});

export default function TermsPage() {
  return <TermsPageContent locale="en" />;
}
