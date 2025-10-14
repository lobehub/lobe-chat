import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { COMPONENTS_DIR, DEMOS_MAP_PATH, SPECIAL_DEMOS_PATHS, THEME_DIR } from './const';
import type { ComponentData } from './types';

/**
 * 查找所有包含 index.md 的组件目录
 */
export function findComponentDirs(): Array<any> {
  const dirs: Array<{ name: string; path: string }> = [];

  // 查找 src/components 下的所有组件
  if (fs.existsSync(COMPONENTS_DIR)) {
    const items = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true });
    items.forEach((item) => {
      if (item.isDirectory()) {
        const componentPath = path.join(COMPONENTS_DIR, item.name);
        const mdPath = path.join(componentPath, 'index.md');
        if (fs.existsSync(mdPath)) {
          dirs.push({ name: item.name, path: componentPath });
        }
      }
    });
  }

  // theme-token
  const themeTokenPath = path.join(COMPONENTS_DIR, 'theme/theme-token');
  const themeTokenMdPath = path.join(themeTokenPath, 'index.md');
  if (fs.existsSync(themeTokenMdPath)) {
    dirs.push({ name: 'ThemeToken', path: themeTokenPath });
  }

  // ThemeProvider
  if (fs.existsSync(THEME_DIR)) {
    const themeProviderPath = path.join(THEME_DIR, 'ThemeProvider');
    const mdPath = path.join(themeProviderPath, 'index.md');
    if (fs.existsSync(mdPath)) {
      dirs.push({ name: 'ThemeProvider', path: themeProviderPath });
    }
  }

  return dirs;
}

/**
 * 获取单个组件的数据
 */
export function getComponentData(componentDir: {
  name: string;
  path: string;
}): ComponentData | null {
  const mdPath = path.join(componentDir.path, 'index.md');

  if (!fs.existsSync(mdPath)) {
    console.log(`⚠️  ${componentDir.name}: index.md 不存在`);
    return null;
  }

  // 读取 markdown 内容
  const readme = fs.readFileSync(mdPath, 'utf8');

  const { data, content } = matter(readme);
  const formatedContent = content
    .replaceAll('\\<', '<')
    .replaceAll("{' '}\n", '')
    .replaceAll(`'<`, `'`)
    .replaceAll(`"<`, `"`)
    .replaceAll(`>'`, `'`)
    .replaceAll(`>"`, `"`)
    .replaceAll(' </', '\n</')
    .replaceAll(' </', '\n</')
    .replaceAll('}> width', '} width')
    .replaceAll("'[https", "'https")
    .replaceAll('"[https', '"https')
    .replaceAll(/]\(http(.*)\/>\)/g, '')
    .replaceAll(`\\*\\* `, '** ')
    .replaceAll(` \\*\\*`, ' **')
    .replaceAll(/\n{2,}/g, '\n\n');

  if (!data?.title) {
    const regex = /^#\s(.+)/;
    const match = regex.exec(formatedContent.trim());
    const title = match ? match[1] : '';
    data.title = title;
  }

  // 确定 demos 路径
  let demosPath: string;
  if (SPECIAL_DEMOS_PATHS[componentDir.name]) {
    demosPath = SPECIAL_DEMOS_PATHS[componentDir.name];
  } else {
    demosPath = `@lobehub/ui-rn/${componentDir.name}/demos`;
  }

  return {
    demosPath,
    name: componentDir.name,
    readme: content,
    ...data,
  } as any;
}

/**
 * 生成 demos-map.ts 文件
 */
export function generateDemosMap(componentDirs: Array<{ name: string; path: string }>) {
  const imports: string[] = [];
  const mapEntries: string[] = [];

  componentDirs.forEach((dir) => {
    const demosPath = SPECIAL_DEMOS_PATHS[dir.name] || `@lobehub/ui-rn/${dir.name}/demos`;

    imports.push(`// ${dir.name}`, `import ${dir.name}Demos from '${demosPath}';`);

    mapEntries.push(`  ${dir.name}: ${dir.name}Demos,`);
  });

  const content = `/**
 * 组件 Demos 映射
 * 此文件自动生成，请勿手动编辑
 * 运行 \`pnpm generate:playground\` 重新生成
 */

${imports.join('\n')}

export const DEMOS_MAP: Record<string, any> = {
${mapEntries.join('\n')}
};
`;

  fs.writeFileSync(DEMOS_MAP_PATH, content, 'utf8');
  console.log(`✅ demos-map.ts 已生成`);
}
