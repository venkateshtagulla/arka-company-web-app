/*import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:`${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;*/
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        //destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
        destination: `https://m7g98jo9eg.execute-api.ap-south-2.amazonaws.com/:path*`,
      },
    ];
  },
};

export default nextConfig;