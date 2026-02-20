"use client"

import Image from "next/image"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
  } = useCart()

  if (!isDrawerOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
        onClick={closeDrawer}
        onKeyDown={(e) => {
          if (e.key === "Escape") closeDrawer()
        }}
        role="button"
        tabIndex={0}
        aria-label="Close cart"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xs tracking-[0.2em] uppercase">Your Bag</h2>
            <span className="flex h-5 w-5 items-center justify-center bg-foreground text-[10px] text-background">
              {totalItems}
            </span>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="text-foreground/70 transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Your bag is empty
            </p>
            <button
              type="button"
              onClick={closeDrawer}
              className="mt-2 border border-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-4"
                  >
                    {/* Image */}
                    <Link
                      href={`/product/${item.product.id}`}
                      onClick={closeDrawer}
                      className="relative h-28 w-20 shrink-0 overflow-hidden bg-muted"
                    >
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.product.id}`}
                            onClick={closeDrawer}
                            className="text-sm leading-tight hover:underline"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(item.product.id, item.size)
                            }
                            aria-label={`Remove ${item.product.name}`}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Size: {item.size}
                        </p>
                      </div>

                      <div className="flex items-end justify-between">
                        {/* Quantity */}
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
                            className="flex h-8 w-8 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
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
                            className="flex h-8 w-8 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
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
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                  Subtotal
                </span>
                <span className="text-sm">
                  PKR {totalPrice.toLocaleString()}
                </span>
              </div>
              <p className="mb-5 text-xs text-muted-foreground">
                Shipping calculated at checkout
              </p>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="mb-3 block w-full bg-foreground py-4 text-center text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
              >
                View Bag
              </Link>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="block w-full border border-foreground py-4 text-center text-xs tracking-[0.2em] uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
