import { PrivacyPageContent } from "@/components/legal/PrivacyPageContent";
import { privacyMeta } from "@/lib/i18n/dictionaries/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: privacyMeta.metaTitle.zh,
  description: "The Vow Page 摯頁電子喜帖平台隱私權政策：說明我們如何蒐集、使用與保護新人及賓客的個人資料。",
  path: "/privacy",
  locale: "zh",
});

export default function PrivacyPage() {
  return <PrivacyPageContent locale="zh" />;
}
