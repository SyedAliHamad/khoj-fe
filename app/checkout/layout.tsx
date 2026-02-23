import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order. Secure checkout at KHOJ.",
  robots: { index: false, follow: true },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
