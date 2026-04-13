import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IRONCORE | Set New Password",
  description: "Set your new gym management account password",
};

export default function ResetPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
