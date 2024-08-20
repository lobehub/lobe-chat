import { Metadata } from 'next';

import { appEnv } from '@/config/app';
import { OFFICIAL_URL, OG_URL } from '@/const/url';
import { translation } from '@/server/translation';

const title = 'LobeChat';

const BASE_PATH = appEnv.NEXT_PUBLIC_BASE_PATH;

// if there is a base path, then we don't need the manifest
const noManifest = !!BASE_PATH;

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await translation('metadata');

  return {
    appleWebApp: {
      statusBarStyle: 'black-translucent',
      title,
    },
    description: t('chat.description'),
    icons: {
      apple: '/apple-touch-icon.png?v=1',
      icon: '/favicon.ico?v=1',
      shortcut: '/favicon-32x32.ico?v=1',
    },
    manifest: noManifest ? undefined : '/manifest.json',
    metadataBase: new URL(OFFICIAL_URL),
    openGraph: {
      description: t('chat.description'),
      images: [
        {
          alt: t('chat.title'),
          height: 640,
          url: OG_URL,
          width: 1200,
        },
      ],
      locale: 'en-US',
      siteName: title,
      title: title,
      type: 'website',
      url: OFFICIAL_URL,
    },
    title: {
      default: t('chat.title'),
      template: '%s · LobeChat',
    },
    twitter: {
      card: 'summary_large_image',
      description: t('chat.description'),
      images: [OG_URL],
      site: '@lobehub',
      title: t('chat.title'),
    },
  };
};
