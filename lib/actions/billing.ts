"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("請先登入");
  return { supabase, user };
}

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function createCheckoutSession(
  weddingId: string
): Promise<{ url: string } | { error: string }> {
  const { supabase, user } = await requireUser();

  // RLS already scopes this to the caller's own weddings, but checking here
  // too means we fail with a clear message instead of a confusing Stripe
  // error further down.
  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, plan")
    .eq("id", weddingId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!wedding) return { error: "找不到這個喜帖" };
  if (wedding.plan !== "draft") return { error: "這個喜帖已經付費過了" };

  const priceId = process.env.STRIPE_STANDARD_PRICE_ID;
  if (!priceId) return { error: "尚未設定付款方案，請聯絡管理員" };

  const origin = await siteOrigin();
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    custom_text: {
      submit: {
        message:
          "❤️ 14 天安心退款保證：付款後 14 天內，只要賓客尚未開始回覆、且婚禮尚未舉行，即可全額退款。\n❤️ 14-Day Peace of Mind Guarantee: full refund within 14 days of payment, as long as no guests have RSVP'd yet and the wedding hasn't taken place.",
      },
    },
    client_reference_id: weddingId,
    metadata: { weddingId },
    customer_email: user.email,
    success_url: `${origin}/dashboard/${weddingId}/edit?checkout=success`,
    cancel_url: `${origin}/dashboard/${weddingId}/edit?checkout=cancelled`,
  });

  if (!session.url) return { error: "無法建立付款頁面，請稍後再試" };
  return { url: session.url };
}
