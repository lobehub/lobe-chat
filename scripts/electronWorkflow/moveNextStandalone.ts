/* eslint-disable unicorn/no-process-exit */
import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const rootDir = path.resolve(__dirname, '../..');

// 定义源目录和目标目录
const sourceDir: string = path.join(rootDir, '.next/standalone');
const targetDir: string = path.join(rootDir, 'apps/desktop/dist/next');

// 向 sourceDir 写入 .env 文件
const env = `APP_URL=http://localhost:3010
FEATURE_FLAGS=+pin_list
KEY_VAULTS_SECRET=oLXWIiR/AKF+rWaqy9lHkrYgzpATbW3CtJp3UfkVgpE=
DATABASE_URL=postgresql://postgres@localhost:5432/postgres
DEFAULT_AGENT_CONFIG="model=deepseek-v3;provider=ollama"`;

fs.writeFileSync(path.join(sourceDir, '.env'), env, 'utf8');
console.log(`⚓️ Inject .env successful`);

// 确保目标目录的父目录存在
fs.ensureDirSync(path.dirname(targetDir));

// 如果目标目录已存在，先删除它
if (fs.existsSync(targetDir)) {
  console.log(`🗑️  Target directory ${targetDir} already exists, deleting...`);
  try {
    fs.removeSync(targetDir);
    console.log(`✅ Old target directory removed successfully`);
  } catch (error) {
    console.warn(`⚠️  Failed to delete target directory: ${error}`);
    console.log('🔄 Trying to delete using system command...');
    try {
      if (os.platform() === 'win32') {
        execSync(`rmdir /S /Q "${targetDir}"`, { stdio: 'inherit' });
      } else {
        execSync(`rm -rf "${targetDir}"`, { stdio: 'inherit' });
      }
      console.log('✅ Successfully deleted old target directory');
    } catch (cmdError) {
      console.error(`❌ Unable to delete target directory, might need manual cleanup: ${cmdError}`);
    }
  }
}

console.log(`🚚 Moving ${sourceDir} to ${targetDir}...`);

try {
  // 使用 fs-extra 的 move 方法
  fs.moveSync(sourceDir, targetDir, { overwrite: true });
  console.log(`✅ Directory moved successfully!`);
} catch (error) {
  console.error('❌ fs-extra move failed:', error);
  console.log('🔄 Trying to move using system command...');

  try {
    // 使用系统命令进行移动
    if (os.platform() === 'win32') {
      execSync(`move "${sourceDir}" "${targetDir}"`, { stdio: 'inherit' });
    } else {
      execSync(`mv "${sourceDir}" "${targetDir}"`, { stdio: 'inherit' });
    }
    console.log('✅ System command move completed successfully!');
  } catch (mvError) {
    console.error('❌ Failed to move directory:', mvError);
    console.log('💡 Try running manually: sudo mv ' + sourceDir + ' ' + targetDir);
    process.exit(1);
  }
}

console.log(`🎉 Move completed!`);
