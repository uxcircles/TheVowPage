import { notFound } from "next/navigation";
import { ClassicTemplate } from "@/components/templates/classic/ClassicTemplate";
import { getPublicWeddingData } from "@/lib/weddings";

export default async function PublicWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicWeddingData(slug);
  if (!data) notFound();

  return <ClassicTemplate data={data} />;
}
