import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component; safe to ignore
            // because proxy.ts refreshes the session on every request.
          }
        },
      },
    }
  );
}

// auth.getUser() does a real network round-trip to Supabase to validate the
// session (not just a local JWT decode), and the dashboard's nested
// layouts + page each called it independently - up to 4 times for a single
// navigation. react's cache() dedupes same-argument calls within one
// request's render pass, so this now only hits the network once per
// request no matter how many layouts/pages call it.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
