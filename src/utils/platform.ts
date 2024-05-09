import UAParser from 'ua-parser-js';

const getParser = () => {
  if (typeof window === 'undefined') return new UAParser('Node');

  let ua = navigator.userAgent;
  return new UAParser(ua);
};

export const getPlatform = () => {
  return getParser().getOS().name;
};

export const getBrowser = () => {
  return getParser().getResult().browser.name;
};

export const browserInfo = {
  browser: getBrowser(),
  isMobile: getParser().getDevice().type === 'mobile',
  os: getParser().getOS().name,
};

export const isMacOS = () => getPlatform() === 'Mac OS';
