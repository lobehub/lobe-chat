import { existsSync, mkdirSync } from 'node:fs';

import { i18nConfig, localeDir } from './const';
import { genDefaultLocale } from './genDefaultLocale';
import { genDiff } from './genDiff';
import { split } from './utils';

// 确保所有语言目录存在
const ensureLocalesDirs = () => {
  [i18nConfig.entryLocale, ...i18nConfig.outputLocales].forEach((locale) => {
    const dir = localeDir(locale);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
};

// 运行工作流
const run = async () => {
  // 确保目录存在
  ensureLocalesDirs();

  // 差异分析
  split('差异分析');
  genDiff();

  // 生成默认语言文件
  split('生成默认语言文件');
  genDefaultLocale();

  // 生成国际化文件
  split('生成国际化文件');
};

run();
