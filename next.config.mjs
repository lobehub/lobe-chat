import nextPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';
const API_END_PORT_URL = process.env.API_END_PORT_URL || '';

// chat plugin market
const PLUGIN_RUNNER_BASE_URL =
  process.env.PLUGIN_RUNNER_BASE_URL || 'https://lobe-chat-plugin-market.vercel.app';

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'api.ts'],
  transpilePackages: ['@lobehub/ui'],

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
        source: '/api/plugins',
        // refs to: https://github.com/lobehub/chat-plugin-market
        destination: `${PLUGIN_RUNNER_BASE_URL}/api/v1/runner`,
      },
    ];
  },
};

export default isProd ? withPWA(nextConfig) : nextConfig;
