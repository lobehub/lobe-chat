import urlJoin from 'url-join';

const UNPKG_API = 'https://unpkg.com';
const ALIYUN_API = 'https://registry.npmmirror.com';

export type CDN = 'aliyun' | 'unpkg';

export interface CdnApi {
  path: string;
  pkg: string;
  proxy?: CDN;
  version?: string;
}

export type EmojiType = 'anim' | 'flat' | 'modern' | 'mono' | 'pure' | '3d';

export function isFlagEmoji(emoji: string) {
  const flagRegex = /(?:\uD83C[\uDDE6-\uDDFF]){2}/;
  return flagRegex.test(emoji);
}

export const genCdnUrl = ({ pkg, version = 'latest', path, proxy }: CdnApi): string => {
  switch (proxy) {
    case 'unpkg': {
      return urlJoin(UNPKG_API, `${pkg}@${version}`, path);
    }
    default: {
      return urlJoin(ALIYUN_API, pkg, version, 'files', path);
    }
  }
};

export function emojiToUnicode(emoji: string) {
  return [...emoji].map((char) => char?.codePointAt(0)?.toString(16)).join('-');
}

export function emojiAnimPkg(emoji: string) {
  const mainPart = emojiToUnicode(emoji).split('-')[0];
  if (mainPart < '1f469') {
    return '@lobehub/fluent-emoji-anim-1';
  } else if (mainPart >= '1f469' && mainPart < '1f620') {
    return '@lobehub/fluent-emoji-anim-2';
  } else if (mainPart >= '1f620' && mainPart < '1f9a0') {
    return '@lobehub/fluent-emoji-anim-3';
  } else {
    return '@lobehub/fluent-emoji-anim-4';
  }
}

export const genEmojiUrl = (emoji: string, type: EmojiType) => {
  const ext = ['anim', '3d'].includes(type) ? 'webp' : 'svg';

  switch (type) {
    case 'pure': {
      return null;
    }
    case 'anim': {
      return {
        path: `assets/${emojiToUnicode(emoji)}.${ext}`,
        pkg: emojiAnimPkg(emoji),
        version: 'latest',
      };
    }
    case '3d': {
      return {
        path: `assets/${emojiToUnicode(emoji)}.${ext}`,
        pkg: '@lobehub/fluent-emoji-3d',
        version: 'latest',
      };
    }
    case 'flat': {
      return {
        path: `assets/${emojiToUnicode(emoji)}.${ext}`,
        pkg: '@lobehub/fluent-emoji-flat',
        version: 'latest',
      };
    }
    case 'modern': {
      return {
        path: `assets/${emojiToUnicode(emoji)}.${ext}`,
        pkg: '@lobehub/fluent-emoji-modern',
        version: 'latest',
      };
    }
    case 'mono': {
      return {
        path: `assets/${emojiToUnicode(emoji)}.${ext}`,
        pkg: '@lobehub/fluent-emoji-mono',
        version: 'latest',
      };
    }
  }
};
