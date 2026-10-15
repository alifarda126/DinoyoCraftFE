import type { Metadata } from "next";
import RegisterForm from "./components/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Mitra Pengrajin",
  description: "Daftarkan toko dan karya keramik Anda di DinoyoCraft.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
