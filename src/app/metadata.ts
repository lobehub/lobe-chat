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
      'https://registry.npmmirror.com/@lobehub/assets-favicons/1.1.0/files/assets/apple-touch-icon.png',
    icon: 'https://registry.npmmirror.com/@lobehub/assets-favicons/1.1.0/files/assets/favicon-32x32.png',
    other: {
      rel: 'mask-icon',
      url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/1.1.0/files/assets/safari-pinned-tab.svg',
    },
  },
  manifest: '/manifest.json',
  openGraph: {
    description: description,
    images: [
      {
        alt: title,
        height: 192,
        url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/1.1.0/files/assets/android-chrome-192x192.png',
        width: 192,
      },
      {
        alt: title,
        height: 512,
        url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/1.1.0/files/assets/android-chrome-512x512.png',
        width: 512,
      },
    ],
    locale: 'en_US',
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
