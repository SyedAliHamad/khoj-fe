import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your KHOJ account, orders, and addresses.",
  robots: { index: false, follow: true },
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
