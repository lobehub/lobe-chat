import { isOnServerSide } from '@/utils/env';

/**
 * check standalone mode in browser
 */
export const isInStandaloneMode = () => {
  if (isOnServerSide) return false;
  return window.matchMedia('(display-mode: standalone)').matches;
};

export const isChromium = () => {
  if (isOnServerSide) return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('chrome') && !userAgent.includes('crios');
};

export const isEdge = () => {
  if (isOnServerSide) return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('edg');
};

export const isIOS = () => {
  if (isOnServerSide) return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad/.test(userAgent);
};

export const isSupportPWA = () => {
  if (isOnServerSide) return false;
  return isChromium() || isEdge();
};
