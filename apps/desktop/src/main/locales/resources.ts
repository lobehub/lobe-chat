import fs from 'node:fs';
import path from 'node:path';

import { resourcesDir } from '@/const/dir';
import { isDev } from '@/const/env';

/**
 * 规范化语言代码
 */
export const normalizeLocale = (locale: string) => {
  return locale.toLowerCase().replace('_', '-');
};

/**
 * 按需加载翻译资源
 */
export const loadResources = async (lng: string, ns: string) => {
  // 开发环境下，直接使用中文源文件
  if (isDev && lng === 'zh-CN') {
    try {
      // 使用 require 加载模块，这在 Electron 中更可靠
      const { default: content } = await import(`@/locales/default/${ns}.ts`);

      return content;
    } catch (error) {
      console.error(`[I18n] 无法加载翻译文件: ${ns}`, error);
      return {};
    }
  }

  // 生产环境使用编译后的 JSON 文件
  const normalizedLocale = normalizeLocale(lng);
  const resourceFilePath = path.join(resourcesDir, 'locales', normalizedLocale, `${ns}.json`);

  try {
    if (fs.existsSync(resourceFilePath)) {
      const content = fs.readFileSync(resourceFilePath, 'utf8');
      return JSON.parse(content);
    } else {
      console.warn(`翻译文件不存在: ${resourceFilePath}`);
      return {};
    }
  } catch (error) {
    console.error(`无法加载翻译文件: ${resourceFilePath}`, error);
    return {};
  }
};
