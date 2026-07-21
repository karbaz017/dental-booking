import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    "raw-partnership-asp-municipal.trycloudflare.com",
  ],
};

export default nextConfig;
