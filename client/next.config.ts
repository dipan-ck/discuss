import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,   // <-- must be inside "typescript"
  },
};

export default nextConfig;
