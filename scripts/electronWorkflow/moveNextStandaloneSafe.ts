/* eslint-disable unicorn/no-process-exit */
import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const rootDir = path.resolve(__dirname, '../..');

// 定义源目录和目标目录
const sourceDir: string = path.join(rootDir, '.next/standalone');
const targetDir: string = path.join(rootDir, 'apps/desktop/dist/next');
const backupDir: string = path.join(rootDir, 'apps/desktop/dist/next.backup');

// 生成带时间戳的备份目录名
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
const timestampedBackupDir = `${backupDir}_${timestamp}`;

console.log('🔒 Starting safe Next.js standalone move operation...');
console.log(`📁 Source: ${sourceDir}`);
console.log(`📁 Target: ${targetDir}`);
console.log(`💾 Backup: ${timestampedBackupDir}`);

// 向 sourceDir 写入 .env 文件
if (fs.existsSync(sourceDir)) {
  const envPath = path.join(rootDir, '.env.desktop');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    fs.writeFileSync(path.join(sourceDir, '.env'), env, 'utf8');
    console.log('⚓️ Inject .env successful');
  } else {
    console.warn('⚠️  .env.desktop not found, skipping injection');
  }
} else {
  console.error(`❌ Source directory does not exist: ${sourceDir}`);
  console.log('💡 Please run "npm run build:electron" first to generate the standalone build');
  process.exit(1);
}

// 确保目标目录的父目录存在
fs.ensureDirSync(path.dirname(targetDir));

// 安全备份现有目标目录
if (fs.existsSync(targetDir)) {
  console.log(`💾 Backing up existing target directory...`);
  try {
    // 创建备份
    fs.copySync(targetDir, timestampedBackupDir);
    console.log(`✅ Backup created: ${timestampedBackupDir}`);
    
    // 删除原目录
    fs.removeSync(targetDir);
    console.log('✅ Old target directory removed successfully');
  } catch (error) {
    console.warn(`⚠️  Failed to backup/delete target directory: ${error}`);
    console.log('🔄 Trying backup with system command...');
    try {
      if (os.platform() === 'win32') {
        execSync(`xcopy "${targetDir}" "${timestampedBackupDir}" /E /I /H`, { stdio: 'inherit' });
        execSync(`rmdir /S /Q "${targetDir}"`, { stdio: 'inherit' });
      } else {
        execSync(`cp -R "${targetDir}" "${timestampedBackupDir}"`, { stdio: 'inherit' });
        execSync(`rm -rf "${targetDir}"`, { stdio: 'inherit' });
      }
      console.log('✅ Successfully backed up and removed old target directory');
    } catch (cmdError) {
      console.error(`❌ Backup/deletion failed: ${cmdError}`);
      console.log('🚨 CRITICAL: Cannot proceed without backup. Manual intervention required.');
      process.exit(1);
    }
  }
}

console.log(`🚚 Moving ${sourceDir} to ${targetDir}...`);

try {
  // 使用 fs-extra 的 move 方法
  fs.moveSync(sourceDir, targetDir, { overwrite: true });
  console.log('✅ Directory moved successfully!');
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
    
    // 尝试恢复备份
    console.log('🔄 Attempting to restore from backup...');
    try {
      if (fs.existsSync(timestampedBackupDir)) {
        fs.moveSync(timestampedBackupDir, targetDir);
        console.log('✅ Backup restored successfully');
      }
    } catch (restoreError) {
      console.error('❌ Failed to restore backup:', restoreError);
    }
    
    console.log('💡 Try running manually: sudo mv ' + sourceDir + ' ' + targetDir);
    process.exit(1);
  }
}

// 清理成功，可以删除临时备份（但保留一些最近的备份）
console.log('🧹 Cleaning up old backups...');
try {
  const distDir = path.join(rootDir, 'apps/desktop/dist');
  const backupFiles = fs.readdirSync(distDir).filter(file => file.startsWith('next.backup_'));
  
  // 保留最近的 3 个备份
  if (backupFiles.length > 3) {
    backupFiles.sort().slice(0, -3).forEach(oldBackup => {
      const oldBackupPath = path.join(distDir, oldBackup);
      fs.removeSync(oldBackupPath);
      console.log(`🗑️  Removed old backup: ${oldBackup}`);
    });
  }
  
  console.log(`💾 Current backup preserved: ${path.basename(timestampedBackupDir)}`);
} catch (cleanupError) {
  console.warn('⚠️  Failed to cleanup old backups:', cleanupError);
}

console.log('🎉 Safe move operation completed successfully!');
console.log('💡 Tips:');
console.log(`  - Your previous files are backed up at: ${timestampedBackupDir}`);
console.log('  - To restore backup: mv ' + timestampedBackupDir + ' ' + targetDir);
console.log('  - Old backups are automatically cleaned (keeping 3 most recent)');