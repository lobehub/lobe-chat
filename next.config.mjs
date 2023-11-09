import nextPWA from '@ducanh2912/next-pwa';
import analyzer from '@next/bundle-analyzer';

const isProd = process.env.NODE_ENV === 'production';
const buildWithDocker = process.env.DOCKER === 'true';

const withBundleAnalyzer = analyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: isProd,
  env: {
    AGENTS_INDEX_URL: process.env.AGENTS_INDEX_URL ?? '',
    PLUGINS_INDEX_URL: process.env.PLUGINS_INDEX_URL ?? '',
  },
  experimental: {
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
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  images: {
    remotePatterns: [
      {
        hostname: 'registry.npmmirror.com',
        pathname: '/@lobehub/assets-emoji/1.3.0/files/assets/**',
        port: '',
        protocol: 'https',
      },
      {
        hostname: 'registry.npmmirror.com',
        pathname: '/@lobehub/assets-emoji-anim/1.0.0/files/assets/**',
        port: '',
        protocol: 'https',
      },
      {
        hostname: 'registry.npmmirror.com',
        pathname: '/@lobehub/assets-logo/1.1.0/files/assets/**',
        port: '',
        protocol: 'https',
      },
      {
        hostname: 'registry.npmmirror.com',
        pathname: '/@lobehub/assets-favicons/latest/files/assets/**',
        port: '',
        protocol: 'https',
      },
    ],
    unoptimized: !isProd,
  },
  output: buildWithDocker ? 'standalone' : undefined,

  reactStrictMode: true,

  transpilePackages: ['@lobehub/ui', 'antd-style', 'lodash-es'],

  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    config.resolve.alias['@ant-design/cssinjs'] = '@ant-design/cssinjs/lib';

    return config;
  },
};

export default isProd ? withBundleAnalyzer(withPWA(nextConfig)) : nextConfig;
