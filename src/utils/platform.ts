import UAParser from 'ua-parser-js';

import { isOnServerSide } from '@/utils/env';

const getParser = () => {
  if (typeof window === 'undefined') return new UAParser('Node');

  let ua = navigator.userAgent;
  return new UAParser(ua);
};

export const getPlatform = () => {
  return getParser().getOS().name || '';
};

export const getBrowser = () => {
  return getParser().getResult().browser.name || '';
};

export const browserInfo = {
  browser: getBrowser(),
  isMobile: getParser().getDevice().type === 'mobile',
  os: getParser().getOS().name,
};

export const isMacOS = () => getPlatform() === 'Mac OS';

export const isInStandaloneMode = () => {
  if (isOnServerSide) return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
  );
};

export const isSonomaOrLaterSafari = () => {
  if (isOnServerSide) return false;
  const userAgent = navigator.userAgent;
  const safariRegex = /Version\/(\d+)\.(\d+)\.?(\d+)? Safari/;
  const match = userAgent.match(safariRegex);

  if (match) {
    const majorVersion = parseInt(match[1], 10);
    return majorVersion >= 16;
  }

  return false;
};
