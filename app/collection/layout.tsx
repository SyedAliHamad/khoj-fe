import type { Metadata } from "next"
import { absoluteUrl } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Collection - Shop White Clothing",
  description:
    "Browse our collection of minimalist white clothing. Dresses, tops, pants, and more. Premium quality, ethical fashion in Pakistan. Free shipping over PKR 5,000.",
  alternates: { canonical: absoluteUrl("/collection") },
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
