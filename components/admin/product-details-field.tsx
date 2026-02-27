"use client"

interface ProductDetailsFieldProps {
  value: string[]
  onChange: (details: string[]) => void
  placeholder?: string
}

export function ProductDetailsField({
  value,
  onChange,
  placeholder = "Hand wash only\n100% Cotton\nModel is 5'7\"",
}: ProductDetailsFieldProps) {
  const textValue = value.filter(Boolean).join("\n")

  function handleChange(text: string) {
    const lines = text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
    onChange(lines.length ? lines : [""])
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground">
        One line per detail. Shown as plain text on the product page.
      </p>
      <textarea
        value={textValue}
        onChange={(e) => handleChange(e.target.value)}
        rows={5}
        placeholder={placeholder}
        className="admin-input w-full resize-y px-4 py-3 text-sm leading-relaxed"
      />
    </div>
  )
}
