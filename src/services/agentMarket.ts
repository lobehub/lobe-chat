import { AGENTS_INDEX_URL } from '@/const/url';

/**
 * 请求助手列表
 */
export const getAgentList = async () => {
  const res = await fetch(AGENTS_INDEX_URL);

  return res.json();
};

/**
 * 请求助手 manifest
 */
export const getAgentManifest = async (manifestUrl: string) => {
  const res = await fetch(manifestUrl);

  return res.json();
};
