import type { Database } from "@/types/database";
import { createServerSideClient } from "@/lib/supabase-server";

export async function getProfile(userId: string) {
  const supabase = await createServerSideClient();
  return supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
}

export async function updateProfile(
  userId: string,
  data: Partial<Database["public"]["Tables"]["profiles"]["Row"]>
) {
  const supabase = await createServerSideClient();
  return supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);
}

export async function getSchedules() {
  const supabase = await createServerSideClient();
  return supabase
    .from("schedules")
    .select("*")
    .order("date", { ascending: true });
}

export async function getBookings(userId: string) {
  const supabase = await createServerSideClient();
  return supabase
    .from("bookings")
    .select(
      `
      *,
      participants (*),
      payment:payments (*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createBooking(data: {
  user_id: string;
  schedule_id: string;
  group_name: string;
  participant_count: number;
  phone: string;
}) {
  const supabase = await createServerSideClient();
  const booking = await supabase
    .from("bookings")
    .insert([data])
    .select()
    .single();
  return booking;
}
