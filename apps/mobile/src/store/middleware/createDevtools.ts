import { optionalDevtools } from 'zustand-utils';
import { devtools as _devtools } from 'zustand/middleware';

import { isDev } from '@/utils/env';

export const createDevtools =
  (name: string): typeof _devtools =>
  (initializer) => {
    let showDevtools = false;

    // In React Native, enable devtools based on development environment
    // or you can use a custom debug flag mechanism if needed
    if (isDev) {
      showDevtools = true;
    }

    // Alternative: You could also check for a global debug flag
    // if (global.__DEV__ || isDev) {
    //   showDevtools = true;
    // }

    return optionalDevtools(showDevtools)(initializer, {
      name: `LobeChat_${name}` + (isDev ? '_DEV' : ''),
    });
  };
