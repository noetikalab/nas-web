import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 独立输出模式，用于 Docker 部署（生成 standalone server.js）
  output: "standalone",
};

export default nextConfig;
