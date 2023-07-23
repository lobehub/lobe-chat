import nextPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';
const API_END_PORT_URL = process.env.API_END_PORT_URL || '';

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'api.ts'],
  transpilePackages: ['@lobehub/ui', 'antd-style'],

  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/api/openai-dev',
        destination: `${API_END_PORT_URL}/api/openai`,
      },
      {
        source: '/api/chain-dev',
        destination: `${API_END_PORT_URL}/api/chain`,
      },
    ];
  },
};

export default isProd ? withPWA(nextConfig) : nextConfig;
