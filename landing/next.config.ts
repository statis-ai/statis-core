import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["statis-kit"],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
