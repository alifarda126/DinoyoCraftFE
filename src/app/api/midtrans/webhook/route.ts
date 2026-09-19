import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/midtrans";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = body;

    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const supabase = createAdminClient();

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      if (!fraud_status || fraud_status === "accept") {
        await supabase
          .from("payments")
          .update({ status: "confirmed" })
          .eq("transaction_id", order_id);

        const { data: payment } = await supabase
          .from("payments")
          .select("booking_id")
          .eq("transaction_id", order_id)
          .single();

        if (payment) {
          await supabase
            .from("bookings")
            .update({ status: "confirmed" })
            .eq("id", payment.booking_id);
        }
      }
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("transaction_id", order_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}