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
        source: '/api/openai/chat-dev',
        destination: `${API_END_PORT_URL}/api/openai/chat`,
      },
      {
        source: '/api/openai/models-dev',
        destination: `${API_END_PORT_URL}/api/openai/models`,
      },
      {
        source: '/api/plugins-dev',
        destination: `${API_END_PORT_URL}/api/plugins`,
      },
    ];
  },
};

export default isProd ? withPWA(nextConfig) : nextConfig;
