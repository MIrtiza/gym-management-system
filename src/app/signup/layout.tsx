import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IRONCORE | Create Account",
  description: "Create your gym management account - 30 days free trial",
};

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
