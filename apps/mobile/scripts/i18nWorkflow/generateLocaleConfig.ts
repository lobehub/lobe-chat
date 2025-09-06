import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// 自动生成语言包配置的脚本
const generateLocaleConfig = () => {
  const localesPath = join(__dirname, '../../locales');
  const outputPath = join(__dirname, '../../src/i18n/generatedConfig.ts');

  try {
    // 读取所有语言目录
    const localeDirs = readdirSync(localesPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    let configContent = `// 自动生成的语言包配置
// 此文件由 scripts/generateLocaleConfig.ts 自动生成，请勿手动修改

export const localeImports: Record<string, Record<string, () => Promise<any>>> = {
`;

    for (const locale of localeDirs) {
      const localePath = join(localesPath, locale);
      const files = readdirSync(localePath, { withFileTypes: true })
        .filter((dirent) => dirent.isFile() && dirent.name.endsWith('.json'))
        .map((dirent) => dirent.name.replace('.json', ''));

      if (files.length > 0) {
        configContent += `  '${locale}': {\n`;

        for (const file of files) {
          configContent += `    ${file}: () => import('../../locales/${locale}/${file}.json'),\n`;
        }

        configContent += `  },\n`;
      }
    }

    configContent += `};

export const getSupportedLocales = (): string[] => {
  return Object.keys(localeImports);
};

export const loadLocaleResources = async (locale: string): Promise<Record<string, any>> => {
  const localeConfig = localeImports[locale];
  if (!localeConfig) {
    throw new Error(\`Locale \${locale} not supported\`);
  }

  const resources: Record<string, any> = {};
  
  for (const [namespace, importFn] of Object.entries(localeConfig)) {
    try {
      const moduleFn = await importFn();
      resources[namespace] = moduleFn.default || moduleFn;
    } catch (error) {
      console.warn(\`Failed to load \${locale}/\${namespace}:\`, error);
    }
  }

  return resources;
};

export const loadAllResources = async (): Promise<Record<string, Record<string, any>>> => {
  const resources: Record<string, Record<string, any>> = {};
  
  for (const locale of getSupportedLocales()) {
    try {
      resources[locale] = await loadLocaleResources(locale);
    } catch (error) {
      console.warn(\`Failed to load locale \${locale}:\`, error);
    }
  }

  return resources;
};

export const getLocaleNamespaces = (locale: string): string[] => {
  const config = localeImports[locale];
  return config ? Object.keys(config) : [];
};
`;

    writeFileSync(outputPath, configContent, 'utf8');
  } catch (error) {
    console.error('❌ 生成语言包配置失败:', error);
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  generateLocaleConfig();
}

export default generateLocaleConfig;
