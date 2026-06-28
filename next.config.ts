import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["cesium"],
  experimental: {
    // Turbopack's default dev filesystem cache can hit concurrent write errors
    // ("Persisting failed / Compaction failed") when navigating between routes.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;