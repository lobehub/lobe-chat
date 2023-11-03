import { consola } from 'consola';
import { markdownTable } from 'markdown-table';
import qs from 'query-string';

import { AGENT_REPO, AGENT_SPLIT, DataItem, MARKET_URL } from './const';
import { fetchAgentIndex, genLink, readReadme, updateReadme, writeReadme } from './utlis';

const genAgentTable = (data: DataItem[], lang: string) => {
  const isCN = lang === 'zh-CN';
  const content = data.slice(0, 4).map((item) => [
    [
      genLink(
        item.meta.title,
        qs.stringifyUrl({
          query: { agent: item.identifier },
          url: MARKET_URL,
        }),
      ),
      `<sup>By **${genLink(item.author, item.homepage)}** on **${item.createAt}**</sup>`,
    ].join('<br/>'),
    [
      item.meta.description,
      item.meta.tags
        .filter(Boolean)
        .map((tag) => `\`${tag}\``)
        .join(' '),
    ].join('<br/>'),
  ]);
  return markdownTable([
    [isCN ? '最近新增' : 'Recent Submits', isCN ? '助手说明' : 'Description'],
    ...content,
  ]);
};

const runAgentTable = async (lang: string) => {
  const data = await fetchAgentIndex(lang);
  const md = readReadme(lang);
  const mdTable = genAgentTable(data, lang);
  const newMd = updateReadme(
    AGENT_SPLIT,
    md,
    [mdTable, `> 📊 Total agents: ${genLink(`<kbd>**${data.length}**</kbd> `, AGENT_REPO)}`].join(
      '\n\n',
    ),
  );
  writeReadme(newMd, lang);
  consola.success('Sync agent index success!');
};

export default async () => {
  await runAgentTable('en-US');
  await runAgentTable('zh-CN');
};
