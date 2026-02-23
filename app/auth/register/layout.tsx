import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your KHOJ account. Join us for minimalist white clothing.",
  robots: { index: false, follow: true },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
