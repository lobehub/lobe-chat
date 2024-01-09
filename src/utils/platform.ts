import UAParser from 'ua-parser-js';

const getPaser = () => {
  let ua = navigator.userAgent;
  return new UAParser(ua);
};

export const getPlatform = () => {
  return getPaser().getOS().name;
};

export const getBrowser = () => {
  return getPaser().getResult().browser.name;
};

export const isMacOS = () => {
  if (!navigator) return false;

  return navigator.platform.toUpperCase().includes('MAC');
};
