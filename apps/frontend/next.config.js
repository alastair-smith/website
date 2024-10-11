const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

if (process.env.NODE_ENV === 'development') {
  setupDevPlatform();
}

module.exports = nextConfig;
