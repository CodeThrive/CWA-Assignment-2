// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // optional: lets Docker builds pass even if ESLint finds issues
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;