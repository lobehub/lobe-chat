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
  return window.matchMedia('(display-mode: standalone)').matches;
};

export const isSonomaOrLaterSafari = () => {
  const browser = getParser().getResult().browser;
  const version = browser.version;
  if (browser.name === 'Safari' && version) {
    const [majorVersion] = version.split('.');
    // Sonoma 版本对应的 Safari 版本号假设为 16.0 或更高
    return parseInt(majorVersion, 10) >= 16;
  }
  return false;
};
