/**
 * App configuration - values can be moved to env or fetched from backend
 */

export const SHIPPING = {
  freeThreshold: Number(process.env.NEXT_PUBLIC_SHIPPING_FREE_THRESHOLD) || 5000,
  fee: Number(process.env.NEXT_PUBLIC_SHIPPING_FEE) || 250,
}

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Kashmir",
  "Gilgit-Baltistan",
]
