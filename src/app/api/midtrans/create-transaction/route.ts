import { NextResponse } from "next/server";
import { createTransaction } from "@/lib/midtrans";
import { createServerSideClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking_id, amount, payment_method, customer } = body;

    const supabase = await createServerSideClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, user_id")
      .eq("id", booking_id)
      .single();

    if (!booking || booking.user_id !== user.id) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }

    const orderId = `DNC-${booking_id.slice(0, 8)}-${Date.now()}`;

    const transaction = await createTransaction({
      order_id: orderId,
      gross_amount: amount,
      customer_details: {
        first_name: customer.name,
        email: user.email!,
        phone: customer.phone,
      },
      item_details: [
        {
          id: "kelas-keramik",
          price: amount,
          quantity: 1,
          name: "Kelas Keramik DinoyoCraft",
        },
      ],
    });

    const admin = createAdminClient();
    await admin.from("payments").insert({
      booking_id,
      amount,
      payment_method,
      transaction_id: orderId,
      status: "pending",
    });

    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
