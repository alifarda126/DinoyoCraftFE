import type { Metadata } from "next";
import LoginForm from "./components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk Akun",
  description: "Masuk ke portal akun DinoyoCraft Anda.",
};

export default function LoginPage() {
  return <LoginForm />;
}
