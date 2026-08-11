import Stripe from "stripe";

// Lazily constructed so importing this module doesn't crash builds/routes
// that never touch Stripe when STRIPE_SECRET_KEY isn't set yet (the SDK
// throws at construction time on an empty key).
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key);
  }
  return _stripe;
}
