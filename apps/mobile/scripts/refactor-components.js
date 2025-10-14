const fs = require('node:fs');
const path = require('node:path');

const componentsDir = path.join(__dirname, '../src/components');

// 获取所有组件目录
const componentDirs = fs.readdirSync(componentsDir).filter((dir) => {
  const fullPath = path.join(componentsDir, dir);
  return fs.statSync(fullPath).isDirectory() && !['styles', 'auth'].includes(dir); // 排除特殊目录
});

console.log('Found components:', componentDirs.length);

componentDirs.forEach((componentName) => {
  const componentDir = path.join(componentsDir, componentName);
  const indexTsxPath = path.join(componentDir, 'index.tsx');
  const indexTsPath = path.join(componentDir, 'index.ts');
  const componentFilePath = path.join(componentDir, `${componentName}.tsx`);
  const typeFilePath = path.join(componentDir, 'type.ts');
  const styleFilePath = path.join(componentDir, 'style.ts');

  // 检查是否有 index.tsx（需要重构）
  if (!fs.existsSync(indexTsxPath)) {
    // 检查是否已经是标准结构
    if (fs.existsSync(componentFilePath) && fs.existsSync(indexTsPath)) {
      console.log(`✅ ${componentName} - 已符合标准结构`);
    } else {
      console.log(`⚠️  ${componentName} - 结构异常，需要手动检查`);
    }
    return;
  }

  console.log(`\n🔧 处理组件: ${componentName}`);

  try {
    // 读取 index.tsx 内容
    const indexTsxContent = fs.readFileSync(indexTsxPath, 'utf8');

    // 检查是否是纯导出文件
    const isPureExport = /^export\s+{\s*default\s*}\s+from\s+["']\.\/\w+["']/m.test(
      indexTsxContent.trim(),
    );

    if (isPureExport) {
      // 如果是纯导出文件，只需要将 index.tsx 重命名为 index.ts
      console.log(`  - 将 index.tsx 重命名为 index.ts`);
      fs.renameSync(indexTsxPath, indexTsPath);
    } else {
      // 如果不是纯导出文件，需要拆分

      // 1. 创建组件主文件
      if (!fs.existsSync(componentFilePath)) {
        console.log(`  - 创建 ${componentName}.tsx`);

        // 提取组件代码（移除 export type）
        let componentContent = indexTsxContent;

        // 移除导出类型的行
        componentContent = componentContent.replaceAll(
          /^export\s+\*\s+from\s+["']\.\/type["'];?\s*$/gm,
          '',
        );
        componentContent = componentContent.replaceAll(
          /^export\s+type\s+\*\s+from\s+["']\.\/type["'];?\s*$/gm,
          '',
        );

        // 添加 displayName（如果没有）
        if (!componentContent.includes('.displayName')) {
          // 查找组件定义
          const componentMatch = componentContent.match(/const\s+(\w+)\s*[:=]/);
          if (componentMatch) {
            const compName = componentMatch[1];
            componentContent = componentContent.replace(
              /export\s+default\s+\w+;/,
              `${compName}.displayName = '${compName}';\n\nexport default ${compName};`,
            );
          }
        }

        fs.writeFileSync(componentFilePath, componentContent);
      } else {
        console.log(`  - ${componentName}.tsx 已存在，跳过`);
      }

      // 2. 创建 index.ts 导出文件
      console.log(`  - 创建 index.ts`);
      const indexContent = `export { default } from './${componentName}';\nexport type * from './type';\n`;
      fs.writeFileSync(indexTsPath, indexContent);

      // 3. 删除旧的 index.tsx
      console.log(`  - 删除 index.tsx`);
      fs.unlinkSync(indexTsxPath);
    }

    // 检查是否缺少 type.ts
    if (!fs.existsSync(typeFilePath)) {
      console.log(`  ⚠️  缺少 type.ts 文件`);
    }

    // 检查是否缺少 style.ts（某些组件可能不需要）
    if (!fs.existsSync(styleFilePath)) {
      console.log(`  ℹ️  缺少 style.ts 文件（可能不需要样式）`);
    }

    console.log(`  ✅ ${componentName} 处理完成`);
  } catch (error) {
    console.error(`  ❌ ${componentName} 处理失败:`, error.message);
  }
});

console.log('\n🎉 批量重构完成！');
