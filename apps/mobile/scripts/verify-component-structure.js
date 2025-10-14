const fs = require('node:fs');
const path = require('node:path');

const componentsDir = path.join(__dirname, '../src/components');

// 获取所有组件目录
const componentDirs = fs.readdirSync(componentsDir).filter((dir) => {
  const fullPath = path.join(componentsDir, dir);
  return fs.statSync(fullPath).isDirectory() && !['styles', 'auth'].includes(dir);
});

console.log('🔍 验证组件结构...\n');

let totalComponents = 0;
let standardComponents = 0;
const issues = [];

componentDirs.forEach((componentName) => {
  const componentDir = path.join(componentsDir, componentName);
  const componentFilePath = path.join(componentDir, `${componentName}.tsx`);
  const indexTsPath = path.join(componentDir, 'index.ts');
  const typeFilePath = path.join(componentDir, 'type.ts');
  const styleFilePath = path.join(componentDir, 'style.ts');
  const indexMdPath = path.join(componentDir, 'index.md');
  const demosDir = path.join(componentDir, 'demos');

  totalComponents++;

  const checks = {
    hasComponentFile: fs.existsSync(componentFilePath),
    hasDemos: fs.existsSync(demosDir) && fs.statSync(demosDir).isDirectory(),
    hasIndexMd: fs.existsSync(indexMdPath),
    hasIndexTs: fs.existsSync(indexTsPath),
    hasStyleFile: fs.existsSync(styleFilePath),
    hasTypeFile: fs.existsSync(typeFilePath),
    // 检查是否有错误的 index.tsx
    hasWrongIndexTsx: fs.existsSync(path.join(componentDir, 'index.tsx')),
  };

  // 标准结构必须有的文件
  const requiredFiles = [
    checks.hasComponentFile && `✅ ${componentName}.tsx`,
    checks.hasIndexTs && '✅ index.ts',
    checks.hasTypeFile && '✅ type.ts',
  ].filter(Boolean);

  // 可选但推荐的文件
  const optionalFiles = [
    checks.hasStyleFile && '✅ style.ts',
    checks.hasIndexMd && '✅ index.md',
    checks.hasDemos && '✅ demos/',
  ].filter(Boolean);

  // 检查是否符合标准
  const isStandard =
    checks.hasComponentFile && checks.hasIndexTs && checks.hasTypeFile && !checks.hasWrongIndexTsx;

  if (isStandard) {
    standardComponents++;
    console.log(`✅ ${componentName}`);

    // 显示可选文件状态
    const missingOptional = [];
    if (!checks.hasStyleFile) missingOptional.push('style.ts');
    if (!checks.hasIndexMd) missingOptional.push('index.md');
    if (!checks.hasDemos) missingOptional.push('demos/');

    if (missingOptional.length > 0) {
      console.log(`   ℹ️  可选文件缺失: ${missingOptional.join(', ')}`);
    }
  } else {
    console.log(`❌ ${componentName}`);

    const componentIssues = [];
    if (!checks.hasComponentFile) componentIssues.push('缺少组件文件');
    if (!checks.hasIndexTs) componentIssues.push('缺少 index.ts');
    if (!checks.hasTypeFile) componentIssues.push('缺少 type.ts');
    if (checks.hasWrongIndexTsx) componentIssues.push('存在错误的 index.tsx');

    console.log(`   ⚠️  ${componentIssues.join(', ')}`);
    issues.push({
      component: componentName,
      issues: componentIssues,
    });
  }

  console.log('');
});

console.log('═'.repeat(60));
console.log(`\n📊 统计结果:\n`);
console.log(`总组件数: ${totalComponents}`);
console.log(
  `符合标准: ${standardComponents} (${((standardComponents / totalComponents) * 100).toFixed(1)}%)`,
);
console.log(`需要修复: ${totalComponents - standardComponents}\n`);

if (issues.length > 0) {
  console.log('⚠️  需要修复的组件:\n');
  issues.forEach(({ component, issues }) => {
    console.log(`  ${component}:`);
    issues.forEach((issue) => console.log(`    - ${issue}`));
  });
} else {
  console.log('🎉 所有组件都符合标准结构！');
}

console.log('\n' + '═'.repeat(60));
