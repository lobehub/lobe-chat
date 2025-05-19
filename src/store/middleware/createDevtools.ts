import { optionalDevtools } from 'zustand-utils';
import { devtools as _devtools } from 'zustand/middleware';

import { isDev } from '@/utils/env';

export const storeNames = new Set<string>();

export const createDevtools =
  (name: string): typeof _devtools =>
    (initializer) => {
      let showDevtools = false;

      if (storeNames.has(name)) {
        console.warn(`[createDevtools] store name ${name} already exists, please use a different name`);
      } else {
        storeNames.add(name);
      }

      // check url to show devtools
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const debug = url.searchParams.get('debug');
        if (debug === '*' || debug?.includes(name)) {
          showDevtools = true;
        }
      }

      return optionalDevtools(showDevtools)(initializer, {
        name: `LobeChat_${name}` + (isDev ? '_DEV' : ''),
      });
    };
