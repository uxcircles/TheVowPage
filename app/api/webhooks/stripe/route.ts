import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const weddingId = session.client_reference_id ?? session.metadata?.weddingId;

    if (weddingId) {
      const admin = createAdminClient();

      // Extends from the current expires_at when there's time left on it
      // (a future renewal paying again before expiry), rather than always
      // resetting to exactly one year from now - that would forfeit
      // whatever time remained.
      const { data: existing } = await admin
        .from("weddings")
        .select("expires_at")
        .eq("id", weddingId)
        .maybeSingle();
      const now = new Date();
      const currentExpiry = existing?.expires_at ? new Date(existing.expires_at) : null;
      const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
      const expiresAt = new Date(base);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const { error } = await admin
        .from("weddings")
        .update({
          plan: "standard",
          paid_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          stripe_checkout_session_id: session.id,
        })
        .eq("id", weddingId);

      if (error) {
        // Returning 500 makes Stripe retry the webhook automatically.
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
