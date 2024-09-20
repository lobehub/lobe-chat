import { kebabCase } from 'lodash-es';
import type { MetadataRoute } from 'next';
import qs from 'query-string';

import { BRANDING_LOGO_URL, BRANDING_NAME } from '@/const/branding';
import { translation } from '@/server/translation';
import { getCanonicalUrl } from '@/server/utils/url';

const genImage = (url: string, version: number = 1) =>
  BRANDING_LOGO_URL || qs.stringifyUrl({ query: { v: version }, url });

const manifest = async (): Promise<MetadataRoute.Manifest | any> => {
  const { t } = await translation('metadata');

  return {
    background_color: '#000000',
    cache_busting_mode: 'all',
    categories: ['productivity', 'design', 'development', 'education'],
    description: t('chat.description', { appName: BRANDING_NAME }),
    display: 'standalone',
    display_override: ['tabbed'],
    edge_side_panel: {
      preferred_width: 480,
    },
    handle_links: 'auto',
    icons: [
      {
        cache_busting_mode: 'query',
        immutable: 'true',
        max_age: 31_536_000,
        purpose: 'any',
        sizes: '192x192',
        src: genImage('/icons/icon-192x192.png', 1),
        type: 'image/png',
      },
      {
        cache_busting_mode: 'query',
        immutable: 'true',
        max_age: 31_536_000,
        purpose: 'maskable',
        sizes: '192x192',
        src: genImage('/icons/icon-192x192.maskable.png', 1),
        type: 'image/png',
      },
      {
        cache_busting_mode: 'query',
        immutable: 'true',
        max_age: 31_536_000,
        purpose: 'any',
        sizes: '512x512',
        src: genImage('/icons/icon-512x512.png', 1),
        type: 'image/png',
      },
      {
        cache_busting_mode: 'query',
        immutable: 'true',
        max_age: 31_536_000,
        purpose: 'maskable',
        sizes: '512x512',
        src: genImage('/icons/icon-512x512.maskable.png', 1),
        type: 'image/png',
      },
    ],
    id: kebabCase(BRANDING_NAME),
    immutable: 'true',
    launch_handler: {
      client_mode: ['navigate-existing', 'auto'],
    },
    max_age: 31_536_000,
    name: BRANDING_NAME,
    orientation: 'portrait',
    related_applications: [
      {
        platform: 'webapp',
        url: getCanonicalUrl('manifest.webmanifest'),
      },
    ],
    scope: '/',
    screenshots: BRANDING_LOGO_URL
      ? []
      : [
          {
            cache_busting_mode: 'query',
            form_factor: 'narrow',
            immutable: 'true',
            max_age: 31_536_000,
            sizes: '640x1138',
            src: genImage('/screenshots/shot-1.mobile.png', 1),
            type: 'image/png',
          },
          {
            cache_busting_mode: 'query',
            form_factor: 'narrow',
            immutable: 'true',
            max_age: 31_536_000,
            sizes: '640x1138',
            src: genImage('/screenshots/shot-2.mobile.png', 1),
            type: 'image/png',
          },
          {
            cache_busting_mode: 'query',
            form_factor: 'narrow',
            immutable: 'true',
            max_age: 31_536_000,
            sizes: '640x1138',
            src: genImage('/screenshots/shot-3.mobile.png', 1),
            type: 'image/png',
          },
          {
            cache_busting_mode: 'query',
            form_factor: 'narrow',
            immutable: 'true',
            max_age: 31_536_000,
            sizes: '640x1138',
            src: genImage('/screenshots/shot-4.mobile.png', 1),
            type: 'image/png',
          },
          {
            cache_busting_mode: 'query',
            form_factor: 'narrow',
            immutable: 'true',
            max_age: 31_536_000,
            sizes: '640x1138',
            src: genImage('/screenshots/shot-5.mobile.png', 1),
            type: 'image/png',
          },
          {
            cache_busting_mode: 'query',
            form_factor: 'wide',
            immutable: 'true',
            max_age: 31_536_000,
            sizes: '1280x676',
            src: genImage('/screenshots/shot-1.desktop.png', 1),
            type: 'image/png',
          },
          {
            cache_busting_mode: 'query',
            form_factor: 'wide',
            immutable: 'true',
            max_age: 31_536_000,
            sizes: '1280x676',
            src: genImage('/screenshots/shot-2.desktop.png', 1),
            type: 'image/png',
          },
          {
            cache_busting_mode: 'query',
            form_factor: 'wide',
            immutable: 'true',
            max_age: 31_536_000,
            sizes: '1280x676',
            src: genImage('/screenshots/shot-3.desktop.png', 1),
            type: 'image/png',
          },
          {
            cache_busting_mode: 'query',
            form_factor: 'wide',
            immutable: 'true',
            max_age: 31_536_000,
            sizes: '1280x676',
            src: genImage('/screenshots/shot-4.desktop.png', 1),
            type: 'image/png',
          },
          {
            cache_busting_mode: 'query',
            form_factor: 'wide',
            immutable: 'true',
            max_age: 31_536_000,
            sizes: '1280x676',
            src: genImage('/screenshots/shot-5.desktop.png', 1),
            type: 'image/png',
          },
        ],
    short_name: BRANDING_NAME,
    splash_pages: null,
    start_url: '.',
    tab_strip: {
      new_tab_button: {
        url: '/',
      },
    },
    theme_color: '#000000',
  };
};

export default manifest;
