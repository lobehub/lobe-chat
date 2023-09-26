import nextPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';
const DEV_API_END_PORT_URL = process.env.DEV_API_END_PORT_URL || '';

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'api.ts'],
  // not sure why antd-style cause multi ThemeProvider instance
  // So we need to transpile it to lib mode
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
        source: '/api/openai/chat-dev',
        destination: `${DEV_API_END_PORT_URL}/api/openai/chat`,
      },
      {
        source: '/api/openai/models-dev',
        destination: `${DEV_API_END_PORT_URL}/api/openai/models`,
      },
      {
        source: '/api/plugins-dev',
        destination: `${DEV_API_END_PORT_URL}/api/plugins`,
      },
    ];
  },
  env: ({
    AGENTS_INDEX_URL: process.env.AGENTS_INDEX_URL,
    PLUGINS_INDEX_URL: process.env.PLUGINS_INDEX_URL,

    ANALYTICS_VERCEL: process.env.ANALYTICS_VERCEL,
    ANALYTICS_MIXPANEL: process.env.ANALYTICS_MIXPANEL,
    ANALYTICS_PLAUSIBLE: process.env.ANALYTICS_PLAUSIBLE,

    PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN,
    MIXPANEL_PROJECT_TOKEN: process.env.ANALYTICS_MIXPANEL,
  })
};

export default isProd ? withPWA(nextConfig) : nextConfig;
