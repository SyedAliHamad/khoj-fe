import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { BrandStatement } from "@/components/brand-statement"
import { CategoriesSection } from "@/components/categories-section"
import { ProductGrid } from "@/components/product-grid"
import { LookbookSection } from "@/components/lookbook-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { SiteFooter } from "@/components/site-footer"
import { SITE_URL, DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/seo"

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: SITE_URL },
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <HeroSection />
        <BrandStatement />
        <CategoriesSection />
        <ProductGrid />
        <LookbookSection />
        <NewsletterSection />
      </main>
      <SiteFooter />
    </div>
  )
}
