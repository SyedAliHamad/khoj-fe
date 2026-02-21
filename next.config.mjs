/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // When frontend & backend are on different servers (e.g. Vercel + VPS),
    // proxy /api/* to the backend so relative image URLs (/api/uploads/*) work.
    // NEXT_PUBLIC_API_BASE_URL may be "https://api.example.com/api" (for fetch) -
    // strip /api to get origin, so we don't end up with /api/api/uploads/...
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const origin = apiBase.replace(/\/api\/?$/, "").replace(/\/$/, "") || apiBase
    return [
      {
        source: "/api/:path*",
        destination: `${origin}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
