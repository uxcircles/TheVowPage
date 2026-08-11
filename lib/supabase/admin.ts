import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Service-role client for trusted server-only contexts (e.g. the Stripe
// webhook) that run with no user session and need to bypass RLS. Never
// import this from client or user-facing server code.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
