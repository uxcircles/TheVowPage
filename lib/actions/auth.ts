"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/authErrors";
import { getLocale } from "@/lib/i18n/locale";
import { SITE_URL } from "@/lib/seo";

export type AuthActionState = { error?: string; needsConfirmation?: string } | undefined;

export type PasswordResetRequestState = { error?: string; sentTo?: string } | undefined;

export type PasswordResetState = { error?: string } | undefined;

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

export async function requestPasswordReset(
  _prevState: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const email = String(formData.get("email") ?? "").trim();

  const supabase = await createClient();
  // Reuses the existing OAuth callback route to exchange the recovery
  // link's code for a session (see app/auth/callback/route.ts) - it
  // already does exactly the exchangeCodeForSession() this needs, just
  // redirecting somewhere else (/reset-password) afterwards instead of
  // /dashboard.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });

  // Supabase doesn't reveal whether the email exists either way (an error
  // here would leak that), so error or not, show the same "check your
  // email" state - matches how the real failure mode (email not
  // registered) should look identical to success for anyone probing
  // for valid accounts.
  if (error) {
    return { sentTo: email };
  }

  return { sentTo: email };
}

export async function resetPassword(
  _prevState: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: translateAuthError(error.message, await getLocale()) };
  }

  redirect("/dashboard");
}
