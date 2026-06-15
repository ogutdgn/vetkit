import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @vetkit/db is a source-only workspace package (no build step) — let Next
  // transpile it instead of expecting prebuilt JS.
  transpilePackages: ['@vetkit/db'],
};

export default nextConfig;
