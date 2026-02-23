import type { Metadata } from "next"
import { getProductById } from "@/lib/api/server-products"
import { absoluteUrl } from "@/lib/seo"
import { getDisplayImageUrl } from "@/lib/image-utils"

type Props = { params: Promise<{ id: string }>; children: React.ReactNode }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return { title: "Product Not Found" }
  }

  const imageUrl = getDisplayImageUrl(product.images?.[0]?.url)
  const ogImage =
    imageUrl.startsWith("http") || imageUrl.startsWith("//")
      ? imageUrl
      : absoluteUrl(imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`)
  const priceFormatted = `PKR ${product.price.toLocaleString()}`
  const title = `${product.name} - White Clothing | KHOJ`
  const description =
    product.description?.slice(0, 160) ||
    `${product.name} - ${priceFormatted}. ${product.fabric || ""}`.slice(0, 160)

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/product/${product.id}`),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/product/${product.id}`),
      siteName: "KHOJ",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.images?.[0]?.alt ?? product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "PKR",
    },
  }
}

export default async function ProductLayout({ params, children }: Props) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return <>{children}</>
  }

  const imgUrl = getDisplayImageUrl(product.images?.[0]?.url)
  const productImage =
    imgUrl.startsWith("http") || imgUrl.startsWith("//")
      ? imgUrl
      : absoluteUrl(imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`)

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collection",
        item: absoluteUrl("/collection"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: absoluteUrl(`/product/${product.id}`),
      },
    ],
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: productImage,
    url: absoluteUrl(`/product/${product.id}`),
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "KHOJ",
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.id}`),
      priceCurrency: "PKR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.category && {
      category: product.category,
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      {children}
    </>
  )
}
