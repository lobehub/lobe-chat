/**
 * 生成 Playground 所需的所有数据
 * 包括组件文档和映射关系
 */
import fs from 'node:fs';
import path from 'node:path';

const COMPONENTS_DIR = path.resolve(__dirname, '../src/components');
const THEME_DIR = path.resolve(__dirname, '../src/theme');
const OUTPUT_PATH = path.resolve(__dirname, '../app/playground/component-data.json');

interface ComponentData {
  demosPath: string;
  name: string;
  readme: string;
}

interface PlaygroundData {
  components: Record<string, ComponentData>;
}

// 特殊组件的 demos 路径配置
const SPECIAL_DEMOS_PATHS: Record<string, string> = {
  ThemeProvider: '@/theme/ThemeProvider/demos',
  ThemeToken: '@/components/theme/theme-token',
};

function findComponentDirs(): Array<{ name: string; path: string }> {
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

function getComponentData(componentDir: { name: string; path: string }): ComponentData | null {
  const mdPath = path.join(componentDir.path, 'index.md');

  if (!fs.existsSync(mdPath)) {
    console.log(`⚠️  ${componentDir.name}: index.md 不存在`);
    return null;
  }

  // 读取 markdown 内容
  const readme = fs.readFileSync(mdPath, 'utf8');

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
    readme,
  };
}

function generateDemosMap(componentDirs: Array<{ name: string; path: string }>) {
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

  const demosMapPath = path.resolve(__dirname, '../app/playground/components/demos-map.ts');
  fs.writeFileSync(demosMapPath, content, 'utf8');
  console.log(`✅ demos-map.ts 已生成`);
}

function main() {
  console.log('🚀 开始生成 Playground 数据...\n');

  const componentDirs = findComponentDirs();
  console.log(`📦 找到 ${componentDirs.length} 个组件\n`);

  const data: PlaygroundData = {
    components: {},
  };

  componentDirs.forEach((dir) => {
    const componentData = getComponentData(dir);
    if (componentData) {
      data.components[dir.name] = componentData;
      console.log(`✅ ${dir.name}`);
    }
  });

  // 写入 JSON 文件
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf8');

  console.log(`\n📝 component-data.json 已生成`);

  // 生成 demos-map.ts
  console.log();
  generateDemosMap(componentDirs);

  console.log(`\n✨ 生成完成！`);
  console.log(`📊 组件数量: ${Object.keys(data.components).length}`);
}

main();
