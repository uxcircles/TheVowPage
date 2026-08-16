"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/authErrors";
import { getLocale } from "@/lib/i18n/locale";

export type AuthActionState = { error?: string; needsConfirmation?: string } | undefined;

export async function signUp(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) {
    return { error: translateAuthError(error.message, await getLocale()) };
  }

  // Email confirmation is required project-wide - signUp() succeeding
  // doesn't mean there's a session yet. Redirecting to /dashboard here
  // (which requires auth) used to just bounce straight back to /login
  // with no explanation, leaving the user with no idea they need to check
  // their inbox. `needsConfirmation` lets the page show that instead.
  if (!data.session) {
    return { needsConfirmation: email };
  }

  redirect("/dashboard");
}

export async function signIn(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: translateAuthError(error.message, await getLocale()) };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
