import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { BrandStatement } from "@/components/brand-statement"
import { CategoriesSection } from "@/components/categories-section"
import { ProductGrid } from "@/components/product-grid"
import { LookbookSection } from "@/components/lookbook-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { SiteFooter } from "@/components/site-footer"

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
