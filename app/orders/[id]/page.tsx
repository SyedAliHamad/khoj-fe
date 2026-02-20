"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Package,
  Truck,
  Check,
  Clock,
  MapPin,
  CreditCard,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ordersApi } from "@/lib/api/orders"
import type { Order } from "@/lib/api/types"

const TRACKING_ICONS: Record<string, typeof Package> = {
  pending: Clock,
  confirmed: Check,
  processing: Package,
  shipped: Truck,
  delivered: Check,
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  card: "Credit / Debit Card",
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    ordersApi
      .getById(id)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setOrder(res.data)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Order not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-4xl px-6 pb-8 pt-16 md:pt-24">
          <Link
            href="/orders"
            className="mb-6 inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            All Orders
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl">
                {order.orderNumber}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="bg-foreground px-4 py-1.5 text-[10px] tracking-[0.15em] uppercase text-background">
              {order.status}
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 pb-20 md:pb-32">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              {order.tracking && order.tracking.length > 0 && (
                <div className="mb-10 border border-border p-6">
                  <h2 className="mb-6 text-xs tracking-[0.2em] uppercase">
                    Order Timeline
                  </h2>
                  <div className="space-y-0">
                    {order.tracking.map((event, i) => {
                      const Icon = TRACKING_ICONS[event.status] ?? Clock
                      const isLast = i === order.tracking!.length - 1
                      const isCurrent = event.status === order.status
                      return (
                        <div key={`${event.status}-${i}`} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center ${
                                isCurrent
                                  ? "bg-foreground text-background"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            {!isLast && (
                              <div className="h-10 w-px bg-border" />
                            )}
                          </div>
                          <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
                            <p
                              className={`text-sm ${isCurrent ? "font-medium" : ""}`}
                            >
                              {event.description}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {(() => {
                                const d = new Date(event.timestamp)
                                return isNaN(d.getTime())
                                  ? event.timestamp
                                  : d.toLocaleString("en-PK", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                              })()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="border border-border p-6">
                <h2 className="mb-5 text-xs tracking-[0.2em] uppercase">
                  Items ({order.items.length})
                </h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <Link
                        href={`/product/${item.productId}`}
                        className="relative h-20 w-16 shrink-0 overflow-hidden bg-muted"
                      >
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <Link
                            href={`/product/${item.productId}`}
                            className="text-sm hover:underline"
                          >
                            {item.productName}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Size: {item.size} / Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm">
                          PKR {item.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {order.shippingAddress && (
                <div className="border border-border p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-xs tracking-[0.15em] uppercase">
                      Shipping Address
                    </h3>
                  </div>
                  <p className="text-sm">{order.shippingAddress.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.shippingAddress.addressLine1}
                  </p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="text-xs text-muted-foreground">
                      {order.shippingAddress.addressLine2}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.province}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.shippingAddress.phone}
                  </p>
                </div>
              )}

              <div className="border border-border p-5">
                <div className="mb-3 flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  <h3 className="text-xs tracking-[0.15em] uppercase">
                    Payment
                  </h3>
                </div>
                <p className="text-sm">
                  {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                </p>
                <p className="mt-1 text-xs text-muted-foreground capitalize">
                  Status: {order.paymentStatus}
                </p>
              </div>

              <div className="border border-border p-5">
                <h3 className="mb-4 text-xs tracking-[0.15em] uppercase">
                  Order Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>PKR {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {order.shippingFee === 0
                        ? "Free"
                        : `PKR ${order.shippingFee.toLocaleString()}`}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Discount</span>
                      <span>-PKR {order.discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-3">
                  <span className="text-xs tracking-[0.1em] uppercase">
                    Total
                  </span>
                  <span className="font-medium">
                    PKR {order.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {order.estimatedDelivery && (
                <div className="border border-border p-5">
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-xs tracking-[0.15em] uppercase">
                      Estimated Delivery
                    </h3>
                  </div>
                  <p className="mt-2 text-sm">
                    {new Date(order.estimatedDelivery).toLocaleDateString(
                      "en-PK",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
