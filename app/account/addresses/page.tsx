"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MapPin, Plus, Pencil, Trash2, Check, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { addressesApi } from "@/lib/api/addresses"
import { PROVINCES } from "@/lib/config"
import type { Address, CreateUserAddressRequest } from "@/lib/api/types"

const DEFAULT_FORM: CreateUserAddressRequest = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  postalCode: "",
  isDefault: false,
}

export default function AddressesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateUserAddressRequest>(DEFAULT_FORM)
  const [formErrors, setFormErrors] = useState<Partial<Record<string, string>>>({})

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login?redirect=/account/addresses")
      return
    }
    if (isAuthenticated) {
      addressesApi
        .list()
        .then((res) => {
          if (res.code === 200 && res.data) setAddresses(res.data)
        })
        .catch(() => toast.error("Failed to load addresses"))
        .finally(() => setLoading(false))
    }
  }, [authLoading, isAuthenticated, router])

  function updateForm(field: keyof CreateUserAddressRequest, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const err: Partial<Record<string, string>> = {}
    if (!form.fullName?.trim()) err.fullName = "Full name is required"
    if (!form.phone?.trim()) err.phone = "Phone is required"
    if (!form.addressLine1?.trim()) err.addressLine1 = "Address is required"
    if (!form.city?.trim()) err.city = "City is required"
    if (!form.province) err.province = "Province is required"
    if (!form.postalCode?.trim()) err.postalCode = "Postal code is required"
    setFormErrors(err)
    return Object.keys(err).length === 0
  }

  function resetForm() {
    setForm(DEFAULT_FORM)
    setFormErrors({})
    setShowForm(false)
    setEditingId(null)
  }

  function openEdit(addr: Address) {
    setForm({
      label: addr.label || "Home",
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const payload: CreateUserAddressRequest = {
      label: form.label || "Home",
      fullName: form.fullName,
      phone: form.phone,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2 || undefined,
      city: form.city,
      province: form.province,
      postalCode: form.postalCode,
      isDefault: form.isDefault ?? false,
    }

    try {
      if (editingId) {
        const res = await addressesApi.update(editingId, payload)
        if (res.code === 200 && res.data) {
          setAddresses((prev) =>
            prev.map((a) => (a.id === editingId ? res.data! : a))
          )
          toast.success("Address updated")
          resetForm()
        } else {
          toast.error(res.message ?? "Failed to update")
        }
      } else {
        const res = await addressesApi.create(payload)
        if (res.code === 200 && res.data) {
          setAddresses((prev) => [...prev, res.data!])
          toast.success("Address added")
          resetForm()
        } else {
          toast.error(res.message ?? "Failed to add")
        }
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return
    const res = await addressesApi.delete(id)
    if (res.code === 200) {
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success("Address deleted")
    } else {
      toast.error(res.message ?? "Failed to delete")
    }
  }

  async function handleSetDefault(id: string) {
    const res = await addressesApi.setDefault(id)
    if (res.code === 200) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      )
      toast.success("Default address updated")
    } else {
      toast.error(res.message ?? "Failed to update")
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <div className="px-6 pb-8 pt-16 md:pt-24">
          <Link
            href="/account"
            className="mb-6 inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Account
          </Link>
          <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            Account
          </p>
          <h1 className="font-serif text-4xl md:text-5xl">Your Addresses</h1>
        </div>

        <div className="mx-auto max-w-2xl px-6 pb-20 md:pb-32">
          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse border border-border bg-muted/30"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="border border-border p-5 transition-colors hover:border-foreground/20"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {addr.label || "Address"}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase bg-foreground text-background">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(addr)}
                          className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(addr.id)}
                          className="p-2 text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm">{addr.fullName}</p>
                    <p className="text-xs text-muted-foreground">{addr.phone}</p>
                    <p className="text-xs text-muted-foreground">
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {addr.city}, {addr.province} {addr.postalCode}
                    </p>
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        className="mt-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {showForm ? (
                <form
                  onSubmit={handleSubmit}
                  className="mt-8 border border-border p-6"
                >
                  <h3 className="mb-5 text-xs tracking-[0.2em] uppercase">
                    {editingId ? "Edit Address" : "Add New Address"}
                  </h3>
                  <div className="space-y-5">
                    <FormField
                      label="Label"
                      value={form.label || ""}
                      onChange={(v) => updateForm("label", v)}
                      placeholder="e.g. Home, Office"
                    />
                    <FormField
                      label="Full Name"
                      value={form.fullName}
                      error={formErrors.fullName}
                      onChange={(v) => updateForm("fullName", v)}
                      placeholder="Your full name"
                      required
                    />
                    <FormField
                      label="Phone"
                      value={form.phone}
                      error={formErrors.phone}
                      onChange={(v) => updateForm("phone", v)}
                      placeholder="+92 300 1234567"
                      required
                    />
                    <FormField
                      label="Address"
                      value={form.addressLine1}
                      error={formErrors.addressLine1}
                      onChange={(v) => updateForm("addressLine1", v)}
                      placeholder="Street address"
                      required
                    />
                    <FormField
                      label="Address Line 2 (Optional)"
                      value={form.addressLine2 || ""}
                      onChange={(v) => updateForm("addressLine2", v)}
                      placeholder="Apartment, suite, etc."
                    />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <FormField
                        label="City"
                        value={form.city}
                        error={formErrors.city}
                        onChange={(v) => updateForm("city", v)}
                        placeholder="Lahore"
                        required
                      />
                      <div>
                        <label className="mb-2 block text-xs tracking-[0.15em] uppercase text-muted-foreground">
                          Province
                        </label>
                        <select
                          value={form.province}
                          onChange={(e) => updateForm("province", e.target.value)}
                          className={`w-full border bg-transparent px-4 py-3.5 text-sm outline-none focus:border-foreground ${
                            formErrors.province ? "border-destructive" : "border-border"
                          }`}
                        >
                          <option value="">Select</option>
                          {PROVINCES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        {formErrors.province && (
                          <p className="mt-1 text-[11px] text-destructive">
                            {formErrors.province}
                          </p>
                        )}
                      </div>
                      <FormField
                        label="Postal Code"
                        value={form.postalCode}
                        error={formErrors.postalCode}
                        onChange={(v) => updateForm("postalCode", v)}
                        placeholder="54000"
                        required
                      />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.isDefault ?? false}
                        onChange={(e) => updateForm("isDefault", e.target.checked)}
                        className="h-4 w-4 border-border"
                      />
                      <span className="text-sm">Set as default address</span>
                    </label>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-foreground px-6 py-3 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {editingId ? "Update" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="border border-border px-6 py-3 text-xs tracking-[0.15em] uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setForm(DEFAULT_FORM)
                    setFormErrors({})
                    setShowForm(true)
                  }}
                  className="mt-8 flex w-full items-center justify-center gap-2 border border-dashed border-border py-8 text-xs tracking-[0.15em] uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Add New Address
                </button>
              )}
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function FormField({
  label,
  value,
  error,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  error?: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-xs tracking-[0.15em] uppercase text-muted-foreground">
        {label}
        {required && " *"}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border bg-transparent px-4 py-3.5 text-sm outline-none focus:border-foreground placeholder:text-muted-foreground/50 ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && (
        <p className="mt-1 text-[11px] text-destructive">{error}</p>
      )}
    </div>
  )
}
