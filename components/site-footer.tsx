import Link from "next/link"

const footerLinks = {
  Shop: ["Collection", "New Arrivals", "Kurtas", "Sets"],
  About: ["Our Story", "Craftsmanship", "Sustainability", "Press"],
  Help: ["Shipping & Returns", "Size Guide", "Contact Us", "FAQs"],
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="mb-4 font-serif text-2xl tracking-[0.3em]">KHOJ</h2>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Minimalist clothing crafted with intention. Based in Pakistan,
              designed for the world.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-xs tracking-[0.2em] uppercase">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            2026 KHOJ. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Instagram", "Pinterest", "TikTok"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
