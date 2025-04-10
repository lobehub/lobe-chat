/* eslint-disable unicorn/no-process-exit */
import fs from 'fs-extra';
import path from 'node:path';

// 获取脚本的命令行参数
const version = process.argv[2];
const isPr = process.argv[3] === 'true';

if (!version) {
  console.error('Missing version parameter, usage: bun run setDesktopVersion.ts <version> [isPr]');
  process.exit(1);
}

// 获取根目录
const rootDir = path.resolve(__dirname, '../..');

// 桌面应用 package.json 的路径
const desktopPackageJsonPath = path.join(rootDir, 'apps/desktop/package.json');

// 更新应用图标
function updateAppIcon() {
  try {
    const buildDir = path.join(rootDir, 'apps/desktop/build');

    // 定义需要处理的图标映射，考虑到大小写敏感性
    const iconMappings = [
      // { ext: '.ico', nightly: 'icon-nightly.ico', normal: 'icon.ico' },
      { ext: '.png', nightly: 'icon-nightly.png', normal: 'icon.png' },
      { ext: '.icns', nightly: 'Icon-nightly.icns', normal: 'Icon.icns' },
    ];

    // 处理每种图标格式
    for (const mapping of iconMappings) {
      const sourceFile = path.join(buildDir, mapping.nightly);
      const targetFile = path.join(buildDir, mapping.normal);

      // 检查源文件是否存在
      if (fs.existsSync(sourceFile)) {
        // 只有当源文件和目标文件不同，才进行复制
        if (sourceFile !== targetFile) {
          fs.copyFileSync(sourceFile, targetFile);
          console.log(`Updated app icon: ${targetFile}`);
        }
      } else {
        console.warn(`Warning: Source icon not found: ${sourceFile}`);
      }
    }
  } catch (error) {
    console.error('Error updating icons:', error);
    // 继续处理，不终止程序
  }
}

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
    packageJson.productName = 'LobeHub';
    packageJson.name = 'lobehub-desktop';

    // 如果是 PR 构建，设置为 Nightly 版本
    if (isPr) {
      // 修改包名，添加 -nightly 后缀
      if (!packageJson.name.endsWith('-nightly')) {
        packageJson.name = `${packageJson.name}-nightly`;
      }

      // 修改产品名称为 LobeHub Nightly
      packageJson.productName = 'LobeHub-Nightly';

      console.log('🌙 Setting as Nightly version with modified package name and productName');

      // 使用 nightly 图标替换常规图标
      updateAppIcon();
    }

    // 写回文件
    fs.writeJsonSync(desktopPackageJsonPath, packageJson, { spaces: 2 });

    console.log(`Desktop app version updated to: ${version}, isPr: ${isPr}`);
  } catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
  }
}

updateVersion();
