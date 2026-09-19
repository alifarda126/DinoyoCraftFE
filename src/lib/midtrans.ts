import crypto from "crypto";
import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function createTransaction(params: {
  order_id: string;
  gross_amount: number;
  customer_details: {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
  };
  item_details: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}) {
  const transaction = await snap.createTransaction(params);
  return transaction;
}

export async function getTransaction(orderId: string) {
  return snap.transaction.status(orderId);
}

export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const signatureString = orderId + statusCode + grossAmount + serverKey;
  const hash = crypto.createHash("sha512").update(signatureString).digest("hex");
  return hash === signatureKey;
}
