import { useRef } from 'react';

import { getBrowser, getPlatform } from '@/utils/platform';

export const usePlatform = () => {
  const platform = useRef(getPlatform());
  const browser = useRef(getBrowser());
  return {
    isApple: platform.current && ['Mac OS', 'iOS'].includes(platform.current),
    isChrome: browser.current === 'Chrome',
    isIOS: platform.current === 'iOS',
    isMacOS: platform.current === 'Mac OS',
    isSafari: browser.current === 'Safari',
  };
};
