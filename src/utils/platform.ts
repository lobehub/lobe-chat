import UAParser from 'ua-parser-js';

const getPaser = () => {
  if (typeof window === 'undefined') return new UAParser('Node');

  let ua = navigator.userAgent;
  return new UAParser(ua);
};

export const getPlatform = () => {
  return getPaser().getOS().name;
};

export const getBrowser = () => {
  return getPaser().getResult().browser.name;
};

export const isMacOS = () => getPlatform() === 'Mac OS';
