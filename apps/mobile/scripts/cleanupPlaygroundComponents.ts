/**
 * 清理 playground/components 目录中的旧组件文件
 * 这些文件已被动态路由 [component].tsx 替代
 */
import fs from 'node:fs';
import path from 'node:path';

const COMPONENTS_DIR = path.resolve(__dirname, '../app/playground/components');
const KEEP_FILES = new Set(['[component].tsx', 'style.ts', 'theme-token.tsx']);

function cleanupComponents() {
  console.log('🧹 开始清理 playground/components 目录...\n');

  const files = fs.readdirSync(COMPONENTS_DIR);
  let deletedCount = 0;

  files.forEach((file) => {
    // 跳过需要保留的文件
    if (KEEP_FILES.has(file)) {
      console.log(`✅ 保留: ${file}`);
      return;
    }

    const filePath = path.join(COMPONENTS_DIR, file);
    const stat = fs.statSync(filePath);

    // 只删除 .tsx 文件
    if (stat.isFile() && file.endsWith('.tsx')) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  删除: ${file}`);
      deletedCount++;
    }
  });

  console.log(`\n✨ 清理完成！共删除 ${deletedCount} 个文件。`);
  console.log('💡 现在所有组件都通过动态路由 [component].tsx 处理。');
}

cleanupComponents();
