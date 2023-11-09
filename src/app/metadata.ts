import { Metadata } from 'next';

import pkg from '../../package.json';

const title = 'LobeChat';
const { description, homepage } = pkg;
const metadata: Metadata = {
  appleWebApp: {
    statusBarStyle: 'black-translucent',
    title,
  },
  description,
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
        url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/og-480x270.png',
        width: 480,
      },
      {
        alt: title,
        height: 720,
        url: 'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/og-960x540.png',
        width: 960,
      },
    ],
    locale: 'en-US',
    siteName: title,
    title: title,
    type: 'website',
    url: homepage,
  },

  title: {
    default: title,
    template: '%s · LobeChat',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@lobehub',
    description,
    images: [
      'https://registry.npmmirror.com/@lobehub/assets-favicons/latest/files/assets/og-960x540.png',
    ],
    title,
  },
};

export default metadata;
