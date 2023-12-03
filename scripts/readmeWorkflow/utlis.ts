import { kebabCase } from 'lodash';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { AGENT_CN_URL, AGENT_EN_URL, PLUGIN_CN_URL, PLUGIN_EN_URL } from './const';

const fetchIndex = async (url: string) => {
  const res = await fetch(url);
  return await res.json();
};

export const fetchAgentIndex = async (lang: string) => {
  const isCN = lang === 'zh-CN';
  const url = isCN ? AGENT_CN_URL : AGENT_EN_URL;
  const data = await fetchIndex(url);
  return data.agents;
};

export const fetchPluginIndex = async (lang: string) => {
  const isCN = lang === 'zh-CN';
  const url = isCN ? PLUGIN_CN_URL : PLUGIN_EN_URL;
  const data = await fetchIndex(url);
  return data.plugins;
};

export const genLink = (title: string, url: string) => `[${title}](${url})`;

export const genTags = (tags: string[]) =>
  tags
    .filter(Boolean)
    .map((tag) => `\`${kebabCase(tag)}\``)
    .join(' ');

const getReadmePath = (lang: string) => {
  const isCN = lang === 'zh-CN';
  return resolve(__dirname, '../../', isCN ? `./README.zh-CN.md` : `./README.md`);
};

export const readReadme = (lang: string): string => {
  return readFileSync(getReadmePath(lang), 'utf8');
};

export const writeReadme = (content: string, lang: string) => {
  writeFileSync(getReadmePath(lang), content, 'utf8');
};

export const updateReadme = (split: string, md: string, content: string): string => {
  const mds = md.split(split);
  mds[1] = [' ', content, ' '].join('\n\n');

  return mds.join(split);
};
