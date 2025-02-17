import fs from 'fs-extra';
import path from 'node:path';

const rootDir = path.resolve(__dirname, '../..');

// 定义源目录和目标目录
const sourceDir: string = path.join(rootDir, '.next/standalone');
const targetDir: string = path.join(rootDir, 'apps/desktop/dist/next');

// 确保目标目录存在
fs.ensureDirSync(targetDir);

// 复制文件
fs.copySync(sourceDir, targetDir, {
  dereference: true,
  overwrite: true,
});

console.log(`copy ${sourceDir} to ${targetDir} successfully`);
