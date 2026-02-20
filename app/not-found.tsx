import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
          <Link href="/">
            <h1 className="font-serif text-2xl tracking-[0.3em] md:text-3xl">
              KHOJ
            </h1>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-lg text-center">
          {/* 404 Number */}
          <p className="font-serif text-[120px] leading-none tracking-wider text-foreground/10 md:text-[180px]">
            404
          </p>

          {/* Message */}
          <div className="-mt-6 space-y-4 md:-mt-10">
            <h2 className="font-serif text-2xl tracking-wide text-foreground md:text-3xl">
              <span className="text-balance">Page Not Found</span>
            </h2>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
              {"The page you're looking for doesn't exist or has been moved. Perhaps you'd like to explore our collection instead."}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 bg-foreground px-8 py-3.5 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
            >
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
            <Link
              href="/collection"
              className="group inline-flex items-center gap-2 border border-foreground px-8 py-3.5 text-xs tracking-[0.2em] uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <Search className="h-3 w-3" />
              Browse Collection
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-6">
          <p className="text-xs text-muted-foreground">
            2026 KHOJ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
