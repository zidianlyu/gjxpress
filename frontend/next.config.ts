import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/batch-updates',
        destination: '/tracking',
        permanent: true,
      },
      {
        source: '/batch-updates/:path*',
        destination: '/tracking',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
