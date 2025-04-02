/* eslint-disable unicorn/no-process-exit */
import fs from 'fs-extra';
import path from 'node:path';

// 获取脚本的命令行参数
const version = process.argv[2];

if (!version) {
  console.error('Missing version parameter, usage: bun run setDesktopVersion.ts <version>');
  process.exit(1);
}

// 获取根目录
const rootDir = path.resolve(__dirname, '../..');

// 桌面应用 package.json 的路径
const desktopPackageJsonPath = path.join(rootDir, 'apps/desktop/package.json');

function updateVersion() {
  try {
    // 确保文件存在
    if (!fs.existsSync(desktopPackageJsonPath)) {
      console.error(`Error: File not found ${desktopPackageJsonPath}`);
      process.exit(1);
    }

    // 读取 package.json 文件
    const packageJson = fs.readJSONSync(desktopPackageJsonPath);

    // 更新版本号
    packageJson.version = version;

    // 写回文件
    fs.writeJsonSync(desktopPackageJsonPath, packageJson, { spaces: 2 });

    console.log(`Desktop app version updated to: ${version}`);
  } catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
  }
}

updateVersion();
