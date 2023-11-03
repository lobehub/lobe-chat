import analyzer from '@next/bundle-analyzer';
import nextPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';
const buildWithDocker = process.env.DOCKER === 'true';

const withBundleAnalyzer = analyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: isProd,
  reactStrictMode: true,
  images: {
    unoptimized: !isProd,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'registry.npmmirror.com',
        port: '',
        pathname: '/@lobehub/assets-emoji/1.3.0/files/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'registry.npmmirror.com',
        port: '',
        pathname: '/@lobehub/assets-emoji-anim/1.0.0/files/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'registry.npmmirror.com',
        port: '',
        pathname: '/@lobehub/assets-logo/1.1.0/files/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'registry.npmmirror.com',
        port: '',
        pathname: '/@lobehub/assets-favicons/latest/files/assets/**',
      },
    ],
  },
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
    forceSwcTransforms: true,
    optimizePackageImports: [
      'modern-screenshot',
      'emoji-mart',
      '@emoji-mart/react',
      '@emoji-mart/data',
      '@icons-pack/react-simple-icons',
      'gpt-tokenizer',
      'chroma-js',
    ],
  },
  transpilePackages: ['@lobehub/ui', 'antd-style', 'lodash-es'],

  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },

  env: {
    AGENTS_INDEX_URL: process.env.AGENTS_INDEX_URL,
    PLUGINS_INDEX_URL: process.env.PLUGINS_INDEX_URL,
  },

  output: buildWithDocker ? 'standalone' : undefined,
};

export default isProd ? withBundleAnalyzer(withPWA(nextConfig)) : nextConfig;
