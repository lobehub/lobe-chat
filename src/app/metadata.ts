import { Metadata } from 'next';

import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import pkg from '../../package.json';

const title = genSiteHeadTitle();
const description = pkg.description;
const metadata: Metadata = {
  appleWebApp: {
    startupImage: [
      'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/splash-750x1624.png',
      {
        media: '(device-width: 768px) and (device-height: 1024px)',
        url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/splash-2048x2732.png',
      },
    ],
    statusBarStyle: 'black-translucent',
    title: title,
  },
  description: description,
  icons: {
    apple:
      'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/apple-touch-icon.png',
    icon: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/favicon-32x32.png',
    other: {
      rel: 'mask-icon',
      url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/safari-pinned-tab.svg',
    },
    shortcut:
      'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    description: description,
    images: [
      {
        alt: title,
        height: 360,
        url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/og-480x360.png',
        width: 480,
      },
      {
        alt: title,
        height: 720,
        url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/og-960x720.png',
        width: 960,
      },
    ],
    locale: 'en-US',
    siteName: title,
    title: title,
    type: 'website',
    url: pkg.homepage,
  },
  themeColor: [
    { color: '#fff', media: '(prefers-color-scheme: light)' },
    { color: '#000', media: '(prefers-color-scheme: dark)' },
  ],
  title: genSiteHeadTitle(),
  viewport: {
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    width: 'device-width',
  },
};

export default metadata;
