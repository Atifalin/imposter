import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["three"],
  serverExternalPackages: ["socket.io"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
