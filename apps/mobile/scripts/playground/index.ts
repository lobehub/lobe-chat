import { uniq } from 'lodash';
import fs from 'node:fs';

import { OUTPUT_PATH } from './const';
import type { PlaygroundData } from './types';
import { findComponentDirs, generateDemosMap, getComponentData } from './utils';

function main() {
  console.log('🚀 开始生成 Playground 数据...\n');

  const componentDirs = findComponentDirs();
  console.log(`📦 找到 ${componentDirs.length} 个组件\n`);

  const data: PlaygroundData = {
    components: {},
    groups: [],
  };

  componentDirs.forEach((dir) => {
    const componentData = getComponentData(dir);
    if (componentData) {
      data.components[dir.name] = componentData;
      data.groups.push(componentData.group);
      console.log(`✅ ${dir.name}`);
    }
  });

  data.groups = uniq(data.groups.filter(Boolean)).sort();

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
