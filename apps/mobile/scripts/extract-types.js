const fs = require('node:fs');
const path = require('node:path');

const componentsDir = path.join(__dirname, '../src/components');

// 需要处理的组件列表（缺少 type.ts 的）
const componentsNeedTypes = [
  'ColorScales',
  'FluentEmoji',
  'Form',
  'GithubAvatar',
  'Highlighter',
  'InstantSwitch',
  'ListGroup',
  'ListItem',
  'Markdown',
  'ModelInfoTags',
  'PageContainer',
  'Skeleton',
  'Slider',
  'Space',
  'Switch',
  'ThemeProvider',
  'ThemeToken',
  'Toast',
  'Tooltip',
];

componentsNeedTypes.forEach((componentName) => {
  const componentDir = path.join(componentsDir, componentName);
  const componentFilePath = path.join(componentDir, `${componentName}.tsx`);
  const typeFilePath = path.join(componentDir, 'type.ts');

  if (!fs.existsSync(componentFilePath)) {
    console.log(`⚠️  ${componentName}.tsx 不存在，跳过`);
    return;
  }

  if (fs.existsSync(typeFilePath)) {
    console.log(`✅ ${componentName} - type.ts 已存在`);
    return;
  }

  console.log(`\n🔧 处理组件: ${componentName}`);

  try {
    // 读取组件文件
    const content = fs.readFileSync(componentFilePath, 'utf8');

    // 提取 export interface 和 export type
    const interfaceMatches = content.match(/export\s+interface\s+\w+Props\s*{[^}]*}/gs);
    const typeMatches = content.match(/export\s+type\s+\w+\s*=\s*[^;]+;/gs);

    if (!interfaceMatches && !typeMatches) {
      console.log(`  ⚠️  未找到导出的类型定义，需要手动创建`);

      // 尝试查找组件 Props
      const propsMatch = content.match(/(?:const|function)\s+\w+[\s:]*(?:React\.)?FC<(\w+Props)>/);
      if (propsMatch) {
        console.log(`  ℹ️  找到 Props 类型: ${propsMatch[1]}，但未导出`);
      }
      return;
    }

    // 收集导入语句
    const imports = new Set();

    // 提取类型中使用的 React 类型
    const allTypes = [...(interfaceMatches || []), ...(typeMatches || [])].join('\n');

    if (allTypes.includes('ReactNode')) imports.add('ReactNode');
    if (allTypes.includes('ReactElement')) imports.add('ReactElement');
    if (allTypes.includes('FC')) imports.add('FC');

    // 提取 React Native 类型
    const rnTypes = [];
    if (allTypes.includes('ViewProps')) rnTypes.push('ViewProps');
    if (allTypes.includes('ViewStyle')) rnTypes.push('ViewStyle');
    if (allTypes.includes('TextProps')) rnTypes.push('TextProps');
    if (allTypes.includes('TextStyle')) rnTypes.push('TextStyle');
    if (allTypes.includes('StyleProp')) rnTypes.push('StyleProp');
    if (allTypes.includes('PressableProps')) rnTypes.push('PressableProps');

    // 构建 type.ts 内容
    let typeFileContent = '';

    if (imports.size > 0) {
      typeFileContent += `import type { ${Array.from(imports).join(', ')} } from 'react';\n`;
    }

    if (rnTypes.length > 0) {
      typeFileContent += `import type { ${rnTypes.join(', ')} } from 'react-native';\n`;
    }

    if (typeFileContent) {
      typeFileContent += '\n';
    }

    // 添加类型定义
    if (interfaceMatches) {
      typeFileContent += interfaceMatches.join('\n\n') + '\n';
    }

    if (typeMatches) {
      if (interfaceMatches) typeFileContent += '\n';
      typeFileContent += typeMatches.join('\n\n') + '\n';
    }

    // 写入 type.ts 文件
    fs.writeFileSync(typeFilePath, typeFileContent);
    console.log(`  ✅ 创建 type.ts 成功`);

    // 更新组件文件，移除导出的类型定义
    let updatedContent = content;

    // 移除 export interface 和 export type
    if (interfaceMatches) {
      interfaceMatches.forEach((match) => {
        updatedContent = updatedContent.replace(match, '');
      });
    }

    if (typeMatches) {
      typeMatches.forEach((match) => {
        updatedContent = updatedContent.replace(match, '');
      });
    }

    // 添加 type.ts 导入
    const importMatch = updatedContent.match(/(import[^;]+from\s+["']\.\/style["'];?\s*\n)/);
    if (importMatch) {
      const propsType =
        content.match(/export\s+interface\s+(\w+Props)/)?.[1] ||
        content.match(/(?:const|function)\s+\w+[\s:]*(?:React\.)?FC<(\w+Props)>/)?.[1];

      if (propsType) {
        updatedContent = updatedContent.replace(
          importMatch[0],
          `${importMatch[0]}import type { ${propsType} } from './type';\n`,
        );
      }
    }

    // 清理多余的空行
    updatedContent = updatedContent.replaceAll(/\n\n\n+/g, '\n\n');

    fs.writeFileSync(componentFilePath, updatedContent);
    console.log(`  ✅ 更新 ${componentName}.tsx 成功`);
  } catch (error) {
    console.error(`  ❌ 处理失败:`, error.message);
  }
});

console.log('\n🎉 类型提取完成！');
