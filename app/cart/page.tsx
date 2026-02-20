"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X, ArrowRight, ShoppingBag, Truck } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCart } from "@/lib/cart-context"
import { SHIPPING } from "@/lib/config"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } =
    useCart()

  const shippingThreshold = SHIPPING.freeThreshold
  const freeShipping = totalPrice >= shippingThreshold
  const remainingForFreeShipping = shippingThreshold - totalPrice

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Page Header */}
        <div className="px-6 pb-8 pt-16 text-center md:pt-24">
          <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            Shopping
          </p>
          <h1 className="font-serif text-4xl md:text-5xl">Your Bag</h1>
          {totalItems > 0 && (
            <p className="mx-auto mt-4 text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your bag
            </p>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center px-6 py-20">
            <ShoppingBag className="mb-6 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 font-serif text-2xl">Your bag is empty</h2>
            <p className="mb-8 max-w-sm text-center text-sm text-muted-foreground">
              Looks like you haven{"'"}t added anything to your bag yet.
              Explore our collection and find something you love.
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
          /* Cart Content */
          <div className="mx-auto max-w-7xl px-6 pb-20 md:pb-32">
            {/* Free Shipping Banner */}
            <div className="mb-10 border border-border p-4 text-center">
              {freeShipping ? (
                <div className="flex items-center justify-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs tracking-[0.1em] uppercase text-muted-foreground">
                    You qualify for free shipping
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Add{" "}
                    <span className="font-medium text-foreground">
                      PKR {remainingForFreeShipping.toLocaleString()}
                    </span>{" "}
                    more for free shipping
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
              {/* Items List */}
              <div className="lg:col-span-2">
                {/* Table Header - desktop */}
                <div className="mb-6 hidden grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-border pb-4 md:grid">
                  <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                    Product
                  </span>
                  <span className="text-center text-xs tracking-[0.15em] uppercase text-muted-foreground">
                    Size
                  </span>
                  <span className="text-center text-xs tracking-[0.15em] uppercase text-muted-foreground">
                    Quantity
                  </span>
                  <span className="text-right text-xs tracking-[0.15em] uppercase text-muted-foreground">
                    Total
                  </span>
                  <span className="w-8" />
                </div>

                <div className="space-y-0">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="border-b border-border py-6"
                    >
                      {/* Desktop Row */}
                      <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 md:grid">
                        {/* Product */}
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/product/${item.product.id}`}
                            className="relative h-24 w-18 shrink-0 overflow-hidden bg-muted"
                          >
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              sizes="72px"
                              className="object-cover"
                            />
                          </Link>
                          <div>
                            <Link
                              href={`/product/${item.product.id}`}
                              className="text-sm hover:underline"
                            >
                              {item.product.name}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                              PKR {item.product.price.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Size */}
                        <p className="text-center text-sm">{item.size}</p>

                        {/* Quantity */}
                        <div className="flex justify-center">
                          <div className="inline-flex items-center border border-border">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.quantity - 1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="flex h-9 w-10 items-center justify-center border-l border-r border-border text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.quantity + 1
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <p className="text-right text-sm">
                          PKR{" "}
                          {(
                            item.product.price * item.quantity
                          ).toLocaleString()}
                        </p>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.product.id, item.size)
                          }
                          aria-label={`Remove ${item.product.name}`}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Mobile Row */}
                      <div className="flex gap-4 md:hidden">
                        <Link
                          href={`/product/${item.product.id}`}
                          className="relative h-32 w-24 shrink-0 overflow-hidden bg-muted"
                        >
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/product/${item.product.id}`}
                                className="text-sm hover:underline"
                              >
                                {item.product.name}
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(item.product.id, item.size)
                                }
                                aria-label={`Remove ${item.product.name}`}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Size: {item.size}
                            </p>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="inline-flex items-center border border-border">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.quantity - 1
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center text-foreground/70"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="flex h-8 w-8 items-center justify-center border-l border-r border-border text-xs">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.quantity + 1
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center text-foreground/70"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="text-sm">
                              PKR{" "}
                              {(
                                item.product.price * item.quantity
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <div className="mt-8">
                  <Link
                    href="/collection"
                    className="group inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowRight className="h-3 w-3 rotate-180 transition-transform group-hover:-translate-x-1" />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:sticky lg:top-40 lg:self-start">
                <div className="border border-border p-6">
                  <h2 className="mb-6 text-xs tracking-[0.2em] uppercase">
                    Order Summary
                  </h2>

                  <div className="space-y-3 border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Subtotal
                      </span>
                      <span className="text-sm">
                        PKR {totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Shipping
                      </span>
                      <span className="text-sm">
                        {freeShipping ? "Free" : "Calculated at checkout"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <span className="text-xs tracking-[0.15em] uppercase">
                      Total
                    </span>
                    <span className="text-lg">
                      PKR {totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-2 block w-full bg-foreground py-4 text-center text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
                  >
                    Proceed to Checkout
                  </Link>

                  <p className="mt-4 text-center text-[11px] text-muted-foreground">
                    Taxes and shipping calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
