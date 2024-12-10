import dayjs from 'dayjs';
import matter from 'gray-matter';
import { markdownToTxt } from 'markdown-to-txt';
import semver from 'semver';
import urlJoin from 'url-join';

import { Locales } from '@/locales/resources';
import { ChangelogIndexItem } from '@/types/changelog';

const BASE_URL = 'https://raw.githubusercontent.com';
const LAST_MODIFIED = new Date().toISOString();

const revalidate: number = 12 * 3600;

export interface ChangelogConfig {
  branch: string;
  changelogPath: string;
  docsPath: string;
  majorVersion: number;
  repo: string;
  type: 'cloud' | 'community';
  user: string;
}

export class ChangelogService {
  config: ChangelogConfig = {
    branch: process.env.DOCS_BRANCH || 'main',
    changelogPath: 'changelog',
    docsPath: 'docs/changelog',
    majorVersion: 1,
    repo: 'lobe-chat',
    type: 'cloud',
    user: 'lobehub',
  };

  async getLatestChangelogId() {
    const index = await this.getChangelogIndex();
    return index[0]?.id;
  }

  async getChangelogIndex(): Promise<ChangelogIndexItem[]> {
    try {
      const url = this.genUrl(urlJoin(this.config.docsPath, 'index.json'));

      const res = await fetch(url, {
        next: { revalidate },
      });

      const data = await res.json();

      return this.mergeChangelogs(data.cloud, data.community).slice(0, 5);
    } catch {
      console.error('Error getting changlog index');
      return false as any;
    }
  }

  async getIndexItemById(id: string) {
    const index = await this.getChangelogIndex();
    return index.find((item) => item.id === id);
  }

  async getPostById(id: string, options?: { locale?: Locales }) {
    try {
      const post = await this.getIndexItemById(id);

      const filename = options?.locale === 'en-US' ? `${id}.mdx` : `${id}.zh-CN.mdx`;
      const url = this.genUrl(urlJoin(this.config.docsPath, filename));

      const response = await fetch(url, {
        next: { revalidate },
      });
      const text = await response.text();
      const { data, content } = matter(text);

      const regex = /^#\s(.+)/;
      const match = regex.exec(content.trim());
      const matches = content.trim().split(regex);

      let description: string;

      if (matches[2]) {
        description = matches[2] ? matches[2].trim() : '';
      } else {
        description = matches[1] ? matches[1].trim() : '';
      }

      return {
        date: post?.date
          ? new Date(post.date)
          : data?.date
            ? new Date(data.date)
            : new Date(LAST_MODIFIED),
        description: markdownToTxt(description.replaceAll('\n', '').replaceAll('  ', ' ')).slice(
          0,
          160,
        ),
        image: post?.image,
        tags: ['changelog'],
        title: match ? match[1] : '',
        ...data,
        content: description,
        rawTitle: match ? match[1] : '',
      };
    } catch {
      console.error('Error getting changlog post by id', id);
      return false as any;
    }
  }

  private mergeChangelogs(
    cloud: ChangelogIndexItem[],
    community: ChangelogIndexItem[],
  ): ChangelogIndexItem[] {
    if (this.config.type === 'community') {
      return community;
    }

    const merged = [...community];

    for (const cloudItem of cloud) {
      const index = merged.findIndex((item) => item.id === cloudItem.id);
      if (index !== -1) {
        merged[index] = cloudItem;
      } else {
        merged.push(cloudItem);
      }
    }

    return merged
      .map((item) => ({
        ...item,
        date: dayjs(item.date).format('YYYY-MM-DD'),
        versionRange: this.formatVersionRange(item.versionRange),
      }))
      .sort((a, b) => semver.rcompare(a.versionRange[0], b.versionRange[0]));
  }

  private formatVersionRange(range: string[]): string[] {
    if (range.length === 1) {
      return range;
    }

    const [v1, v2]: any = range.map((v) => semver.parse(v)?.toString());

    const minVersion = semver.lt(v1, v2) ? v1 : v2;
    const maxVersion = semver.gt(v1, v2) ? v1 : v2;

    return [maxVersion, minVersion];
  }

  private genUrl(path: string) {
    return urlJoin(BASE_URL, this.config.user, this.config.repo, this.config.branch, path);
  }
}
