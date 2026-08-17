import { PrivacyPageContent } from "@/components/legal/PrivacyPageContent";
import { privacyMeta } from "@/lib/i18n/dictionaries/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: privacyMeta.metaTitle.en,
  description: "Privacy Policy for The Vow Page's online wedding invitation platform: how we collect, use and protect couples' and guests' personal data.",
  path: "/en/privacy",
  locale: "en",
});

export default function PrivacyPage() {
  return <PrivacyPageContent locale="en" />;
}
