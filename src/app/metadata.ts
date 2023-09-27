import { Metadata } from 'next';

import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import pkg from '../../package.json';

const title = genSiteHeadTitle();
const description = pkg.description;
const metadata: Metadata = {
  appleWebApp: {
    statusBarStyle: 'black-translucent',
    title: title,
  },
  description: description,
  icons: {
    apple:
      'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/apple-touch-icon.png',
    icon: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/favicon-32x32.png',
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
        url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/1.4.0/files/assets/og-480x270.png',
        width: 480,
      },
      {
        alt: title,
        height: 720,
        url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/1.4.0/files/assets/og-960x540.png',
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
  title: title,
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
