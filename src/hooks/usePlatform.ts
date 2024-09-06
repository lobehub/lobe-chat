import { useRef } from 'react';

import {
  getBrowser,
  getPlatform,
  isInStandaloneMode,
  isSonomaOrLaterSafari,
} from '@/utils/platform';

export const usePlatform = () => {
  const platform = useRef(getPlatform());
  const browser = useRef(getBrowser());

  const platformInfo = {
    isApple: platform.current && ['Mac OS', 'iOS'].includes(platform.current),
    isChrome: browser.current === 'Chrome',
    isChromium: browser.current && ['Chrome', 'Edge', 'Opera', 'Brave'].includes(browser.current),
    isEdge: browser.current === 'Edge',
    isIOS: platform.current === 'iOS',
    isMacOS: platform.current === 'Mac OS',
    isPWA: isInStandaloneMode(),
    isSafari: browser.current === 'Safari',
    isSonomaOrLaterSafari: isSonomaOrLaterSafari(),
  };

  return {
    ...platformInfo,
    isSupportInstallPWA:
      (platformInfo.isChromium && !platformInfo.isIOS) ||
      (platformInfo.isMacOS && platformInfo.isSonomaOrLaterSafari),
  };
};
