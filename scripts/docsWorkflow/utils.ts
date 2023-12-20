import { readFileSync, writeFileSync } from 'node:fs';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { SPLIT } from './const';

export const updateDocs = (path: string, content: string) => {
  const md = readFileSync(path, 'utf8');
  const mds = md.split(SPLIT);
  mds[1] = [' ', content, ' '].join('\n\n');
  const result = mds.join(SPLIT);
  writeFileSync(path, result, 'utf8');
};

export const convertMarkdownToMdast = async (md: string) => {
  // @ts-ignore
  return unified().use(remarkParse).use(remarkGfm).parse(md.trim());
};

export const getTitle = async (path: string) => {
  const md = readFileSync(path, 'utf8');
  const mdast: any = await convertMarkdownToMdast(md);

  let title = '';
  visit(mdast, 'heading', (node) => {
    if (node.depth !== 1) return;
    visit(node, 'text', (heading) => {
      title += heading.value;
    });
  });
  return title;
};

export const genMdLink = (title: string, url: string) => {
  return `[${title}](${url})`;
};
