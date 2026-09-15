import { createServerSideClient } from "@/lib/supabase-server";

export async function getUser() {
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = await createServerSideClient();
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createServerSideClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = await createServerSideClient();
  return supabase.auth.signOut();
}
