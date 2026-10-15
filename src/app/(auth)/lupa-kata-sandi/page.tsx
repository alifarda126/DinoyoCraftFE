import type { Metadata } from "next";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi",
  description: "Reset kata sandi akun DinoyoCraft Anda.",
};

export default function LupaKataSandiPage() {
  return <ForgotPasswordForm />;
}
