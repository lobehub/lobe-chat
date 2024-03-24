import { globSync } from 'glob';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fixWinPath = (path: string) => path.replaceAll('\\', '/');

export const root = resolve(__dirname, '../..');

const run = () => {
  const posts = globSync(fixWinPath(resolve(root, 'docs/**/*.mdx')));

  for (const post of posts) {
    const mdx = readFileSync(post, 'utf8');
    const formatedMdx = mdx
      .replaceAll('\\<', '<')
      .replaceAll("{' '}\n", '')
      .replaceAll(`'<`, `'`)
      .replaceAll(`"<`, `"`)
      .replaceAll(`>'`, `'`)
      .replaceAll(`>"`, `"`)
      .replaceAll(' </', '\n</')
      .replaceAll(' </', '\n</')
      .replaceAll(`\\*\\* `, '** ')
      .replaceAll(` \\*\\*`, ' **')
      .replaceAll(/\n{2,}/g, '\n\n');

    writeFileSync(post, formatedMdx);
  }
};

run();
