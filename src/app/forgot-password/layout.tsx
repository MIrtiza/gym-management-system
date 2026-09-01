import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IRONCORE | Reset Password",
  description: "Reset your gym management account password",
};

export default function ForgotPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
