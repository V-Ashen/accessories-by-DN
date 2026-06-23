import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // --- NEW: Redirect /admin to the separate Admin Panel deployment ---
  async redirects() {
    return [
      {
        source: '/admin',
        destination: 'https://accessories-by-dn-admin.vercel.app',
        permanent: true,
      },
      // This catches anything typed after /admin (e.g., /admin/orders)
      {
        source: '/admin/:path*',
        destination: 'https://accessories-by-dn-admin.vercel.app/:path*',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;