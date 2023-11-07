import UAParser from 'ua-parser-js';

export const getPlatform = () => {
  const ua = navigator.userAgent;
  return new UAParser(ua || '').getOS();
};

export const isApplePlatform = () => {
  const platform = getPlatform().name;
  return platform && ['Mac OS', 'iOS'].includes(platform);
};
