const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
  images: {
    domains: ['localhost'],
  },
  // Transpile the local SDK package for Next.js bundling
  transpilePackages: ['@oasis/wallet-sdk'],
  webpack: (config) => {
    // Ensure the SDK's dependencies resolve from the frontend's node_modules
    // so that @noble/curves/ed25519 subpath imports work correctly
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      ...(config.resolve.modules || ['node_modules']),
    ]
    // Fallback for Node.js built-ins used by crypto libs
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: false,
    }
    return config
  },
}

module.exports = nextConfig