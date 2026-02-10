import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;

// import type { NextConfig } from "next";
// const isDev = process.env.NODE_ENV === "development";

// const nextConfig: NextConfig = {
//   async rewrites() {
//     if (!isDev) return [];

//     return [
//       {
//         source: "/api/:path*",
//         //destination: "http://127.0.0.1:8000/:path*",
//         destination: "https://dharnpt0p4.execute-api.ap-south-2.amazonaws.com/:path*",
//         //destination:process.env.NODE_ENV
//       },
//     ];
//   },
// };

// export default nextConfig;
