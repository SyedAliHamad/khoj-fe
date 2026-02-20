"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingBag,
  Truck,
  Shield,
  MapPin,
} from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { checkoutApi } from "@/lib/api/checkout"
import { addressesApi } from "@/lib/api/addresses"
import { PROVINCES, SHIPPING } from "@/lib/config"
import type { PaymentMethod, Address } from "@/lib/api/types"

type Step = "shipping" | "payment" | "review" | "confirmation"

const STEPS: { key: Step; label: string }[] = [
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
]

const PAYMENT_METHODS: {
  id: PaymentMethod
  label: string
  description: string
  icon: typeof CreditCard
}[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: Banknote,
  },
  {
    id: "jazzcash",
    label: "JazzCash",
    description: "Pay via JazzCash mobile wallet",
    icon: Smartphone,
  },
  {
    id: "easypaisa",
    label: "Easypaisa",
    description: "Pay via Easypaisa mobile wallet",
    icon: Smartphone,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, UnionPay",
    icon: CreditCard,
  },
]

interface ShippingForm {
  fullName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  postalCode: string
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [step, setStep] = useState<Step>("shipping")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    postalCode: "",
  })
  const [shippingErrors, setShippingErrors] = useState<
    Partial<Record<keyof ShippingForm, string>>
  >({})

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")

  useEffect(() => {
    if (isAuthenticated) {
      addressesApi.list().then((res) => {
        if (res.code === 200 && res.data) {
          setSavedAddresses(res.data)
          const defaultAddr = res.data.find((a) => a.isDefault) ?? res.data[0]
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id)
            setShippingForm((prev) => ({
              ...prev,
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              addressLine1: defaultAddr.addressLine1,
              addressLine2: defaultAddr.addressLine2 || "",
              city: defaultAddr.city,
              province: defaultAddr.province,
              postalCode: defaultAddr.postalCode,
              email: user?.email || prev.email,
            }))
          } else if (user?.email) {
            setShippingForm((prev) => ({ ...prev, email: user.email }))
          }
        }
      })
      if (user?.email) {
        setShippingForm((prev) => (prev.email ? prev : { ...prev, email: user.email }))
      }
    }
  }, [isAuthenticated, user?.email])

  const shippingFee = totalPrice >= SHIPPING.freeThreshold ? 0 : SHIPPING.fee
  const tax = 0
  const orderTotal = totalPrice + shippingFee + tax

  function updateShipping(field: keyof ShippingForm, value: string) {
    setShippingForm((prev) => ({ ...prev, [field]: value }))
    if (shippingErrors[field]) {
      setShippingErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validateShipping(): boolean {
    const errors: Partial<Record<keyof ShippingForm, string>> = {}
    if (!shippingForm.fullName.trim()) errors.fullName = "Full name is required"
    if (!shippingForm.email.trim()) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(shippingForm.email))
      errors.email = "Enter a valid email"
    if (!shippingForm.phone.trim()) errors.phone = "Phone number is required"
    if (!shippingForm.addressLine1.trim())
      errors.addressLine1 = "Address is required"
    if (!shippingForm.city.trim()) errors.city = "City is required"
    if (!shippingForm.province) errors.province = "Province is required"
    if (!shippingForm.postalCode.trim())
      errors.postalCode = "Postal code is required"

    setShippingErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleContinueToPayment() {
    if (validateShipping()) {
      setStep("payment")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function handleContinueToReview() {
    setStep("review")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handlePlaceOrder() {
    setIsProcessing(true)
    try {
      const res = await checkoutApi.createOrderWithItems({
        address: {
          fullName: shippingForm.fullName,
          phone: shippingForm.phone,
          addressLine1: shippingForm.addressLine1,
          addressLine2: shippingForm.addressLine2 || undefined,
          city: shippingForm.city,
          province: shippingForm.province,
          postalCode: shippingForm.postalCode,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          size: item.size,
          quantity: item.quantity,
        })),
        paymentMethod,
      })
      if (res.code === 200 && res.data) {
        setOrderNumber(res.data.orderNumber)
        clearCart()
        setStep("confirmation")
      } else {
        toast.error(res.message ?? "Failed to place order")
      }
    } catch {
      toast.error("Failed to place order")
    } finally {
      setIsProcessing(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === step)

  // Empty cart guard
  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <ShoppingBag className="mb-6 h-16 w-16 text-muted-foreground/30" />
        <h1 className="mb-2 font-serif text-2xl">Your bag is empty</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Add some items before checking out.
        </p>
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 bg-foreground px-10 py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
        >
          Shop Collection
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="font-serif text-2xl tracking-[0.3em]">
            KHOJ
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Secure Checkout
            </span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      {step !== "confirmation" && (
        <div className="border-b border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-0 px-6 py-5 md:gap-8">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 md:gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center text-xs ${
                    i < currentStepIndex
                      ? "bg-foreground text-background"
                      : i === currentStepIndex
                        ? "border-2 border-foreground text-foreground"
                        : "border border-border text-muted-foreground"
                  }`}
                >
                  {i < currentStepIndex ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`hidden text-xs tracking-[0.1em] uppercase md:block ${
                    i <= currentStepIndex
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="mx-2 h-px w-8 bg-border md:mx-4 md:w-16" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        {step === "confirmation" ? (
          /* ========== CONFIRMATION ========== */
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-foreground">
              <Check className="h-7 w-7 text-background" />
            </div>
            <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
              Order Confirmed
            </p>
            <h1 className="mb-3 font-serif text-3xl md:text-4xl">
              Thank You
            </h1>
            <p className="mb-2 text-sm text-muted-foreground">
              Your order has been placed successfully.
            </p>
            <p className="mb-8 text-sm text-muted-foreground">
              Order number:{" "}
              <span className="font-medium text-foreground">{orderNumber}</span>
            </p>

            <div className="mb-8 border border-border p-6 text-left">
              <h3 className="mb-4 text-xs tracking-[0.15em] uppercase">
                What Happens Next?
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-[10px]">
                    1
                  </div>
                  <div>
                    <p className="text-sm">Confirmation email sent</p>
                    <p className="text-xs text-muted-foreground">
                      Check your inbox for order details
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-[10px]">
                    2
                  </div>
                  <div>
                    <p className="text-sm">Order processing</p>
                    <p className="text-xs text-muted-foreground">
                      We will prepare your items with care
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-[10px]">
                    3
                  </div>
                  <div>
                    <p className="text-sm">Delivery in 3-5 business days</p>
                    <p className="text-xs text-muted-foreground">
                      Track your order from your account
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/orders"
                className="inline-flex items-center justify-center gap-2 bg-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
              >
                View Orders
              </Link>
              <Link
                href="/collection"
                className="inline-flex items-center justify-center gap-2 border border-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* ========== FORM + SUMMARY LAYOUT ========== */
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Left: Form Area */}
            <div className="lg:col-span-3">
              {step === "shipping" && (
                <ShippingStep
                  form={shippingForm}
                  errors={shippingErrors}
                  onChange={updateShipping}
                  onContinue={handleContinueToPayment}
                  savedAddresses={savedAddresses}
                  selectedAddressId={selectedAddressId}
                  onSelectAddress={(addr) => {
                    setSelectedAddressId(addr.id)
                    setShippingForm((prev) => ({
                      ...prev,
                      fullName: addr.fullName,
                      phone: addr.phone,
                      addressLine1: addr.addressLine1,
                      addressLine2: addr.addressLine2 || "",
                      city: addr.city,
                      province: addr.province,
                      postalCode: addr.postalCode,
                      email: user?.email || prev.email,
                    }))
                  }}
                  onUseNewAddress={() => {
                    setSelectedAddressId(null)
                    setShippingForm((prev) => ({
                      ...prev,
                      fullName: "",
                      phone: "",
                      addressLine1: "",
                      addressLine2: "",
                      city: "",
                      province: "",
                      postalCode: "",
                      email: user?.email || "",
                    }))
                  }}
                  isAuthenticated={isAuthenticated}
                />
              )}

              {step === "payment" && (
                <PaymentStep
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                  onBack={() => setStep("shipping")}
                  onContinue={handleContinueToReview}
                />
              )}

              {step === "review" && (
                <ReviewStep
                  items={items}
                  shippingForm={shippingForm}
                  paymentMethod={paymentMethod}
                  shippingFee={shippingFee}
                  orderTotal={orderTotal}
                  isProcessing={isProcessing}
                  onBack={() => setStep("payment")}
                  onPlaceOrder={handlePlaceOrder}
                />
              )}
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-8">
                <div className="border border-border p-6">
                  <h3 className="mb-5 text-xs tracking-[0.2em] uppercase">
                    Order Summary
                  </h3>

                  <div className="max-h-64 space-y-4 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3"
                      >
                        <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-muted">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-foreground text-[9px] text-background">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs leading-snug">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Size: {item.size}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs">
                          PKR{" "}
                          {(
                            item.product.price * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-2 border-t border-border pt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>PKR {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shippingFee === 0
                          ? "Free"
                          : `PKR ${shippingFee.toLocaleString()}`}
                      </span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Tax</span>
                        <span>PKR {tax.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between border-t border-border pt-4">
                    <span className="text-xs tracking-[0.15em] uppercase">
                      Total
                    </span>
                    <span className="text-base font-medium">
                      PKR {orderTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Trust Signals */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Secure SSL encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" />
                    <span>Free shipping above PKR 5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

/* ========== SHIPPING STEP ========== */
function ShippingStep({
  form,
  errors,
  onChange,
  onContinue,
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onUseNewAddress,
  isAuthenticated,
}: {
  form: ShippingForm
  errors: Partial<Record<keyof ShippingForm, string>>
  onChange: (field: keyof ShippingForm, value: string) => void
  onContinue: () => void
  savedAddresses: Address[]
  selectedAddressId: string | null
  onSelectAddress: (addr: Address) => void
  onUseNewAddress: () => void
  isAuthenticated: boolean
}) {
  const showSavedAddresses = isAuthenticated && savedAddresses.length > 0

  return (
    <div>
      <h2 className="mb-1 font-serif text-2xl">Shipping Address</h2>
      <p className="mb-8 text-sm text-muted-foreground">
        Where should we deliver your order?
      </p>

      {showSavedAddresses && (
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
              Saved Addresses
            </p>
            <Link
              href="/account/addresses"
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Manage addresses
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => onSelectAddress(addr)}
                  className={`flex items-start gap-3 border p-4 text-left transition-colors ${
                    isSelected
                      ? "border-foreground bg-foreground/[0.03]"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border ${
                      isSelected ? "border-foreground bg-foreground" : "border-border"
                    }`}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 text-background" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {addr.label || "Address"}
                      {addr.isDefault && (
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          (Default)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {addr.city}, {addr.province} {addr.postalCode}
                    </p>
                  </div>
                </button>
              )
            })}
            <button
              type="button"
              onClick={onUseNewAddress}
              className={`flex items-center gap-2 border p-4 transition-colors ${
                !selectedAddressId
                  ? "border-foreground bg-foreground/[0.03]"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Enter new address</span>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Row: Name + Email */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            id="fullName"
            label="Full Name"
            value={form.fullName}
            error={errors.fullName}
            onChange={(v) => onChange("fullName", v)}
            placeholder="Your full name"
            autoComplete="name"
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(v) => onChange("email", v)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <FormField
          id="phone"
          label="Phone Number"
          type="tel"
          value={form.phone}
          error={errors.phone}
          onChange={(v) => onChange("phone", v)}
          placeholder="+92 300 1234567"
          autoComplete="tel"
        />

        <FormField
          id="addressLine1"
          label="Address"
          value={form.addressLine1}
          error={errors.addressLine1}
          onChange={(v) => onChange("addressLine1", v)}
          placeholder="Street address"
          autoComplete="address-line1"
        />

        <FormField
          id="addressLine2"
          label="Address Line 2 (Optional)"
          value={form.addressLine2}
          onChange={(v) => onChange("addressLine2", v)}
          placeholder="Apartment, suite, unit, etc."
          autoComplete="address-line2"
        />

        {/* Row: City + Province + Postal */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField
            id="city"
            label="City"
            value={form.city}
            error={errors.city}
            onChange={(v) => onChange("city", v)}
            placeholder="Lahore"
            autoComplete="address-level2"
          />
          <div>
            <label
              htmlFor="province"
              className="mb-2 block text-xs tracking-[0.15em] uppercase text-muted-foreground"
            >
              Province
            </label>
            <select
              id="province"
              value={form.province}
              onChange={(e) => onChange("province", e.target.value)}
              className={`w-full border bg-transparent px-4 py-3.5 text-sm outline-none transition-colors focus:border-foreground ${
                errors.province ? "border-destructive" : "border-border"
              } ${!form.province ? "text-muted-foreground/50" : ""}`}
            >
              <option value="">Select</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="mt-1 text-[11px] text-destructive">
                {errors.province}
              </p>
            )}
          </div>
          <FormField
            id="postalCode"
            label="Postal Code"
            value={form.postalCode}
            error={errors.postalCode}
            onChange={(v) => onChange("postalCode", v)}
            placeholder="54000"
            autoComplete="postal-code"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Bag
        </Link>
        <button
          type="button"
          onClick={onContinue}
          className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
        >
          Continue
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

/* ========== PAYMENT STEP ========== */
function PaymentStep({
  selected,
  onSelect,
  onBack,
  onContinue,
}: {
  selected: PaymentMethod
  onSelect: (m: PaymentMethod) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div>
      <h2 className="mb-1 font-serif text-2xl">Payment Method</h2>
      <p className="mb-8 text-sm text-muted-foreground">
        How would you like to pay?
      </p>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon
          const isSelected = selected === method.id
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={`flex w-full items-center gap-4 border p-5 text-left transition-colors ${
                isSelected
                  ? "border-foreground bg-foreground/[0.03]"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center ${
                  isSelected ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{method.label}</p>
                <p className="text-xs text-muted-foreground">
                  {method.description}
                </p>
              </div>
              <div
                className={`flex h-5 w-5 items-center justify-center border ${
                  isSelected ? "border-foreground bg-foreground" : "border-border"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-background" />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Shipping
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex items-center gap-2 bg-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
        >
          Review Order
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

/* ========== REVIEW STEP ========== */
function ReviewStep({
  items,
  shippingForm,
  paymentMethod,
  shippingFee,
  orderTotal,
  isProcessing,
  onBack,
  onPlaceOrder,
}: {
  items: { id: string; product: { name: string; image: string; price: number }; size: string; quantity: number }[]
  shippingForm: ShippingForm
  paymentMethod: PaymentMethod
  shippingFee: number
  orderTotal: number
  isProcessing: boolean
  onBack: () => void
  onPlaceOrder: () => void
}) {
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? paymentMethod

  return (
    <div>
      <h2 className="mb-1 font-serif text-2xl">Review Your Order</h2>
      <p className="mb-8 text-sm text-muted-foreground">
        Please review the details before placing your order.
      </p>

      {/* Shipping Summary */}
      <div className="mb-6 border border-border p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs tracking-[0.15em] uppercase">
            Shipping Address
          </h3>
          <button
            type="button"
            onClick={() => onBack()}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Edit
          </button>
        </div>
        <p className="text-sm">{shippingForm.fullName}</p>
        <p className="text-xs text-muted-foreground">
          {shippingForm.addressLine1}
          {shippingForm.addressLine2 && `, ${shippingForm.addressLine2}`}
        </p>
        <p className="text-xs text-muted-foreground">
          {shippingForm.city}, {shippingForm.province}{" "}
          {shippingForm.postalCode}
        </p>
        <p className="text-xs text-muted-foreground">{shippingForm.phone}</p>
      </div>

      {/* Payment Summary */}
      <div className="mb-6 border border-border p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs tracking-[0.15em] uppercase">
            Payment Method
          </h3>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Edit
          </button>
        </div>
        <p className="text-sm">{paymentLabel}</p>
      </div>

      {/* Items Summary */}
      <div className="mb-6 border border-border p-5">
        <h3 className="mb-4 text-xs tracking-[0.15em] uppercase">
          Items ({items.length})
        </h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative h-12 w-9 shrink-0 overflow-hidden bg-muted">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs">{item.product.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  Size: {item.size} / Qty: {item.quantity}
                </p>
              </div>
              <p className="text-xs">
                PKR {(item.product.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Total */}
      <div className="mb-8 flex items-center justify-between border border-border p-5">
        <span className="text-xs tracking-[0.15em] uppercase">
          Order Total
        </span>
        <span className="text-lg font-medium">
          PKR {orderTotal.toLocaleString()}
        </span>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Payment
        </button>
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isProcessing}
          className="flex items-center gap-2 bg-foreground px-10 py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : "Place Order"}
          {!isProcessing && <ArrowRight className="h-3 w-3" />}
        </button>
      </div>
    </div>
  )
}

/* ========== FORM FIELD COMPONENT ========== */
function FormField({
  id,
  label,
  type = "text",
  value,
  error,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string
  label: string
  type?: string
  value: string
  error?: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs tracking-[0.15em] uppercase text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`w-full border bg-transparent px-4 py-3.5 text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground/50 ${
          error ? "border-destructive" : "border-border"
        }`}
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-1 text-[11px] text-destructive">{error}</p>
      )}
    </div>
  )
}
