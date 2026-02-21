"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, ArrowRight, ShoppingBag } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ordersApi } from "@/lib/api/orders"
import { getDisplayImageUrl } from "@/lib/image-utils"
import type { Order } from "@/lib/api/types"

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-muted", text: "text-muted-foreground" },
  confirmed: { bg: "bg-foreground/10", text: "text-foreground" },
  processing: { bg: "bg-foreground/10", text: "text-foreground" },
  shipped: { bg: "bg-foreground/15", text: "text-foreground" },
  delivered: { bg: "bg-foreground", text: "text-background" },
  cancelled: { bg: "bg-destructive/10", text: "text-destructive" },
  returned: { bg: "bg-destructive/10", text: "text-destructive" },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ordersApi
      .list(1, 20)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setOrders(res.data.items ?? [])
        } else {
          setError(res.message ?? "Failed to load orders")
        }
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <div className="px-6 pb-8 pt-16 text-center md:pt-24">
          <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            Account
          </p>
          <h1 className="font-serif text-4xl md:text-5xl">Your Orders</h1>
        </div>

        {isLoading ? (
          <div className="mx-auto max-w-4xl px-6 pb-20 md:pb-32">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse border border-border bg-muted/30"
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-6 py-20">
            <p className="text-center text-sm text-muted-foreground">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20">
            <ShoppingBag className="mb-6 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 font-serif text-2xl">No orders yet</h2>
            <p className="mb-8 text-center text-sm text-muted-foreground">
              When you place an order, it will appear here.
            </p>
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 bg-foreground px-10 py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
            >
              Shop Collection
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl px-6 pb-20 md:pb-32">
            <div className="space-y-4">
              {orders.map((order) => {
                const style = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="group block border border-border p-5 transition-colors hover:border-foreground/30 md:p-6"
                  >
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {order.orderNumber}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-PK",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${style.bg} ${style.text}`}
                        >
                          {order.status}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="relative h-12 w-10 overflow-hidden border border-background bg-muted"
                          >
                            <Image
                              src={getDisplayImageUrl(item.productImage)}
                              alt={item.productName}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <p className="text-sm">
                        PKR {order.total.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
