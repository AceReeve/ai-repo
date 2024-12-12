import { Configuration } from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CLAUDE_API_KEY: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
  },
  webpack: (config: Configuration) => {
    if (config.resolve) {
      config.resolve.fallback = { fs: false, net: false, tls: false };
    }
    return config;
  }
};

export default nextConfig;