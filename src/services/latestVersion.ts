const VERSION_URL = 'https://registry.npmmirror.com/@lobehub/chat';

/**
 * get latest version from npm
 */
export const featLatestVersion = async (): Promise<string> => {
  const res = await fetch(VERSION_URL);
  const data = await res.json();

  return data['dist-tags']?.latest;
};
