import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IRONCORE | Admin Login",
  description: "Gym Management System - Admin Login",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
