import { Metadata } from 'next';

import { appEnv } from '@/config/app';
import { BRANDING_LOGO_URL, BRANDING_NAME, ORG_NAME } from '@/const/branding';
import { OFFICIAL_URL, OG_URL } from '@/const/url';
import { isCustomBranding, isCustomORG } from '@/const/version';
import { translation } from '@/server/translation';

const BASE_PATH = appEnv.NEXT_PUBLIC_BASE_PATH;

// if there is a base path, then we don't need the manifest
const noManifest = !!BASE_PATH;

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await translation('metadata');

  return {
    alternates: {
      canonical: OFFICIAL_URL,
    },
    appleWebApp: {
      statusBarStyle: 'black-translucent',
      title: BRANDING_NAME,
    },
    description: t('chat.description', { appName: BRANDING_NAME }),
    icons: isCustomBranding
      ? BRANDING_LOGO_URL
      : {
          apple: '/apple-touch-icon.png?v=1',
          icon: '/favicon.ico?v=1',
          shortcut: '/favicon-32x32.ico?v=1',
        },
    manifest: noManifest ? undefined : '/manifest.json',
    metadataBase: new URL(OFFICIAL_URL),
    openGraph: {
      description: t('chat.description', { appName: BRANDING_NAME }),
      images: [
        {
          alt: t('chat.title', { appName: BRANDING_NAME }),
          height: 640,
          url: OG_URL,
          width: 1200,
        },
      ],
      locale: 'en-US',
      siteName: BRANDING_NAME,
      title: BRANDING_NAME,
      type: 'website',
      url: OFFICIAL_URL,
    },
    title: {
      default: t('chat.title', { appName: BRANDING_NAME }),
      template: `%s · ${BRANDING_NAME}`,
    },
    twitter: {
      card: 'summary_large_image',
      description: t('chat.description', { appName: BRANDING_NAME }),
      images: [OG_URL],
      site: isCustomORG ? `@${ORG_NAME}` : '@lobehub',
      title: t('chat.title', { appName: BRANDING_NAME }),
    },
  };
};
