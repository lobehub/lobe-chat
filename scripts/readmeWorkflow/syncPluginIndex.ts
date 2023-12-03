import { consola } from 'consola';
import { markdownTable } from 'markdown-table';

import { DataItem, PLGUIN_URL, PLUGIN_REPO, PLUGIN_SPLIT } from './const';
import { fetchPluginIndex, genLink, genTags, readReadme, updateReadme, writeReadme } from './utlis';

const genPluginTable = (data: DataItem[], lang: string) => {
  const isCN = lang === 'zh-CN';
  const content = data
    .filter((item) => item.author === 'LobeHub')
    .map((item) => [
      [
        genLink(item.meta.title, PLGUIN_URL),
        `<sup>By **${item.author}** on **${item.createAt}**</sup>`,
      ].join('<br/>'),
      genLink(item.homepage.split('github.com/')[1], item.homepage),
      [item.meta.description, genTags(item.meta.tags)].join('<br/>'),
    ]);
  return markdownTable([
    isCN ? ['官方插件', '仓库', '插件描述'] : ['Official Plugin', 'Repository', 'Description'],
    ...content,
  ]);
};

const runPluginTable = async (lang: string) => {
  const data = await fetchPluginIndex(lang);
  const md = readReadme(lang);
  const mdTable = genPluginTable(data, lang);
  const newMd = updateReadme(
    PLUGIN_SPLIT,
    md,
    [mdTable, `> 📊 Total plugins: ${genLink(`<kbd>**${data.length}**</kbd>`, PLUGIN_REPO)}`].join(
      '\n\n',
    ),
  );
  writeReadme(newMd, lang);
  consola.success('Sync plugin index success!');
};

export default async () => {
  await runPluginTable('en-US');
  await runPluginTable('zh-CN');
};
