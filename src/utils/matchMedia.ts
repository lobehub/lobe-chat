/**
 * check standalone mode in browser
 */
export const isInStandaloneMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(display-mode: standalone)').matches;
};
