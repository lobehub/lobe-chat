import matter from 'gray-matter';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LAST_MODIFIED = new Date().toISOString();

export class DocService {
  async getDocByPath(locale: string, path: string) {
    const extra = locale === 'zh-CN' ? '.zh-CN.mdx' : '.mdx';

    const localPath = join(process.cwd(), 'docs/', path) + extra;

    const isLocalePathExist = existsSync(localPath);

    if (!isLocalePathExist) return;

    const text: string = readFileSync(localPath, 'utf8');

    if (!text) return;

    const { data, content } = matter(text);

    const regex = /^#\s(.+)/;
    const match = regex.exec(content);
    const matches = content.split(regex);
    const description = matches[1] ? matches[1].trim() : '';
    return {
      date: data?.date ? new Date(data.date) : new Date(LAST_MODIFIED),
      description: description.replaceAll('\n', '').replaceAll('  ', ' ').slice(0, 160),
      tags: [],
      title: match ? match[1] : '',
      ...data,
      content,
    };
  }
}

// 很奇怪，需要加一行这个 `readdirSync` 才能在 vercel 部署后读到 md 文件
// 否则没法正常找到 mdx 文件
readdirSync(join(process.cwd(), 'docs'));
