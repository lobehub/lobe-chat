import { isOnServerSide } from '@/utils/env';

export const useHead = (prop: string, name: string) => {
  if (isOnServerSide) return '';
  return document.querySelector(`meta[${prop}='${name}']`)?.getAttribute('content') || '';
};

export const useTitle = () => {
  if (isOnServerSide) return '';
  return document.querySelector(`title`)?.innerHTML || '';
};

export const useLd = () => {
  if (isOnServerSide) return '';
  return document.querySelector(`script[type='application/ld+json']`)?.innerHTML || '';
};
