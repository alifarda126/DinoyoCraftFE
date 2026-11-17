"use client";

export function formatPaymentLabel(method?: string, bank?: string | null): string {
  const m = (method || "").toLowerCase();
  if (m === "qris") return "QRIS";
  if (m === "bca_va") return "BCA VA";
  if (m === "bni_va") return "BNI VA";
  if (m === "bri_va") return "BRI VA";
  if (m === "permata_va") return "Permata VA";
  if (m === "mandiri_bill") return "Mandiri Bill";
  if (m === "gopay") return "GoPay";
  if (m === "shopeepay" || m === "shopee_pay" || m === "shopee-pay") return "ShopeePay";
  if (m === "ovo") return "OVO";
  if (m === "dana") return "DANA";
  if (bank) return `${bank.toUpperCase()} VA`;
  return m ? m.toUpperCase() : "Midtrans";
}

export function getPaymentLogo(method?: string, bank?: string | null): string | null {
  const m = (method || "").toLowerCase().trim();
  const b = (bank || "").toLowerCase().trim();
  const key = b || m;

  if (m === "qris" || key.includes("qris")) return "/payment/qris.svg";
  if (key.includes("bca")) return "/payment/bca.svg";
  if (key.includes("bni")) return "/payment/bni.svg";
  if (key.includes("bri")) return "/payment/bri.svg";
  if (key.includes("mandiri")) return "/payment/mandiri.svg";
  if (key.includes("gopay")) return "/payment/gopay.svg";
  if (key.includes("shopee")) return "/payment/shopeepay.svg";
  if (key.includes("ovo")) return "/payment/ovo.svg";
  if (key.includes("dana")) return "/payment/dana.svg";
  return null;
}

interface PaymentMethodBadgeProps {
  method?: string;
  bank?: string | null;
  statusSuffix?: string;
}

export function PaymentMethodBadge({
  method,
  bank,
  statusSuffix,
}: PaymentMethodBadgeProps) {
  const label = formatPaymentLabel(method, bank);
  const logoSrc = getPaymentLogo(method, bank);

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200/80 text-zinc-700 text-[11px] font-semibold">
      {logoSrc && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={logoSrc}
          alt={label}
          className="h-3.5 w-auto max-w-[44px] object-contain shrink-0"
        />
      )}
      <span>
        {label}
        {statusSuffix ? ` ${statusSuffix}` : ""}
      </span>
    </span>
  );
}
