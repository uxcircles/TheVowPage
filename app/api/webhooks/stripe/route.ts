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
      const { error } = await admin
        .from("weddings")
        .update({
          plan: "standard",
          paid_at: new Date().toISOString(),
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
