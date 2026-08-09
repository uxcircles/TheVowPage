"use client";

import { useTransition } from "react";
import { setWeddingStatus } from "@/lib/actions/weddings";

export function PublishToggle({
  weddingId,
  status,
  slug,
}: {
  weddingId: string;
  status: string;
  slug: string;
}) {
  const [pending, startTransition] = useTransition();
  const isPublished = status === "published";
  const publicPath = `/w/${slug}`;

  return (
    <section className="flex flex-col gap-3 rounded border border-[var(--brand-line)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-[var(--brand-ink-soft)]">
          狀態：<span className="font-medium text-foreground">{isPublished ? "已發布" : "草稿"}</span>
        </p>
        {isPublished && (
          <a href={publicPath} target="_blank" rel="noopener" className="text-sm text-[var(--brand-gold)] underline">
            {publicPath}
          </a>
        )}
      </div>
      <div className="flex gap-2">
        <a
          href={publicPath}
          target="_blank"
          rel="noopener"
          className="rounded border border-[var(--brand-line)] px-4 py-2 text-sm text-[var(--brand-ink-soft)] transition-colors hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
        >
          預覽喜帖
        </a>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setWeddingStatus(weddingId, isPublished ? "draft" : "published");
            })
          }
          className="rounded border border-[var(--brand-gold)] px-4 py-2 text-sm text-[var(--brand-gold)] transition-colors hover:bg-[var(--brand-gold)] hover:text-white disabled:opacity-60"
        >
          {pending ? "處理中..." : isPublished ? "取消發布" : "發布喜帖"}
        </button>
      </div>
    </section>
  );
}
