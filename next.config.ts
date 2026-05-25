import type { NextConfig } from "next";

const AUTH_BACKEND = process.env.AUTH_BACKEND || "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
