import { kebabCase } from 'lodash-es';
import type { MetadataRoute } from 'next';

import { BRANDING_LOGO_URL, BRANDING_NAME } from '@/const/branding';
import { manifestModule } from '@/server/manifest';

const manifest = (): MetadataRoute.Manifest | any => {
  return manifestModule.generate({
    description: `${BRANDING_NAME} brings you the best UI experience for ChatGPT, Claude, Gemini, and OLLaMA.`,
    icons: [
      {
        purpose: 'any',
        sizes: '192x192',
        url: '/icons/icon-192x192.png',
      },
      {
        purpose: 'maskable',
        sizes: '192x192',
        url: '/icons/icon-192x192.maskable.png',
      },
      {
        purpose: 'any',
        sizes: '512x512',
        url: '/icons/icon-512x512.png',
      },
      {
        purpose: 'maskable',
        sizes: '512x512',
        url: '/icons/icon-512x512.maskable.png',
      },
    ],
    id: kebabCase(BRANDING_NAME),
    name: BRANDING_NAME,
    screenshots: BRANDING_LOGO_URL
      ? []
      : [
          {
            form_factor: 'narrow',
            url: '/screenshots/shot-1.mobile.png',
          },
          {
            form_factor: 'narrow',
            url: '/screenshots/shot-2.mobile.png',
          },
          {
            form_factor: 'narrow',
            url: '/screenshots/shot-3.mobile.png',
          },
          {
            form_factor: 'narrow',
            url: '/screenshots/shot-4.mobile.png',
          },
          {
            form_factor: 'narrow',
            url: '/screenshots/shot-5.mobile.png',
          },
          {
            form_factor: 'wide',
            url: '/screenshots/shot-1.desktop.png',
          },
          {
            form_factor: 'wide',
            url: '/screenshots/shot-2.desktop.png',
          },
          {
            form_factor: 'wide',
            url: '/screenshots/shot-3.desktop.png',
          },
          {
            form_factor: 'wide',
            url: '/screenshots/shot-4.desktop.png',
          },
          {
            form_factor: 'wide',
            url: '/screenshots/shot-5.desktop.png',
          },
        ],
  });
};

export default manifest;
