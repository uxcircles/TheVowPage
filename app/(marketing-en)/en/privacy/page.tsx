import { PrivacyPageContent } from "@/components/legal/PrivacyPageContent";
import { privacyMeta } from "@/lib/i18n/dictionaries/legal";

export const metadata = { title: privacyMeta.metaTitle.en };

export default function PrivacyPage() {
  return <PrivacyPageContent locale="en" />;
}
