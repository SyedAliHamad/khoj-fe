/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // When frontend & backend are on different servers (e.g. Vercel + VPS),
    // proxy /api/* to the backend so relative image URLs (/api/uploads/*) work
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
    const base = apiBase.replace(/\/$/, "")
    return [
      {
        source: "/api/:path*",
        destination: `${base}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
