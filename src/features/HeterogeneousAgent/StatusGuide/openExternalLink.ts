export const openExternalLink = async (url: string): Promise<void> => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
