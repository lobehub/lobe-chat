import { useMemo, useRef } from 'react';

import { isOnServerSide } from '@/utils/env';
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
    isApple: platform.current && ['Mac OS', 'iOS'].includes(platform.current.toLowerCase()),
    isArc:
      (!isOnServerSide &&
        window.matchMedia('(--arc-palette-focus: var(--arc-background-simple-color))').matches) ||
      Boolean('arc' in window || 'ArcControl' in window || 'ARCControl' in window),
    isChrome: browser.current === 'Chrome',
    isChromium: browser.current && ['Chrome', 'Edge', 'Opera', 'Brave'].includes(browser.current),
    isEdge: browser.current === 'Edge',
    isFirefox: browser.current === 'Firefox',
    isIOS: platform.current === 'iOS',
    isMacOS: platform.current === 'Mac OS',
    isPWA: isInStandaloneMode(),
    isSafari: browser.current === 'Safari',
    isSonomaOrLaterSafari: isSonomaOrLaterSafari(),
  };

  return useMemo(
    () => ({
      ...platformInfo,
      isSupportInstallPWA:
        !platformInfo.isArc &&
        !platformInfo.isFirefox &&
        ((platformInfo.isChromium && !platformInfo.isIOS) ||
          (platformInfo.isMacOS && platformInfo.isSonomaOrLaterSafari)),
    }),
    [platformInfo],
  );
};
