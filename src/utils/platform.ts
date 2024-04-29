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

export const getEngine = () => {
  return getParser().getEngine().name;
}

export const browserInfo = {
  browser: getBrowser(),
  isMobile: getParser().getDevice().type === 'mobile',
  os: getParser().getOS().name,
};

export const isMacOS = () => getPlatform() === 'Mac OS';

// 文字拖拽仅支持 Windows/Linux - Chromium 系浏览器 (#2111)
export const allowTextDrag = () => {
  const platform = getPlatform();
  return platform && /Linux|Windows/.test(platform) && getEngine() === 'Blink';
}
