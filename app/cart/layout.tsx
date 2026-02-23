import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "View your bag. Complete your order at KHOJ.",
  robots: { index: false, follow: true },
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
