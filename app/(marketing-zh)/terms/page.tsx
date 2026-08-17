import { TermsPageContent } from "@/components/legal/TermsPageContent";
import { termsMeta } from "@/lib/i18n/dictionaries/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: termsMeta.metaTitle.zh,
  description: "The Vow Page 摯頁電子喜帖平台服務條款：帳號、付費發布、退款保證與內容授權相關規定。",
  path: "/terms",
  locale: "zh",
});

export default function TermsPage() {
  return <TermsPageContent locale="zh" />;
}
