/*
<ai_context>
Configures Next.js for the app.
</ai_context>
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "*.supabase.co" }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcrypt"]
  }
}

export default nextConfig
