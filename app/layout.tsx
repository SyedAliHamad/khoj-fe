import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { ThemeProvider } from "@/lib/theme-provider"
import { CartDrawer } from "@/components/cart-drawer"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "KHOJ - White Clothing",
  description:
    "Discover the art of white. Minimalist clothing crafted with intention.",
}

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "0",
              border: "1px solid hsl(30 10% 88%)",
              fontFamily: "var(--font-inter)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  )
}
