import * as dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import path from 'node:path';

const isDesktop = process.env.NEXT_PUBLIC_IS_DESKTOP_APP === '1';

dotenv.config();
// 创建需要排除的特性映射
/* eslint-disable sort-keys-fix/sort-keys-fix */
const partialBuildPages = [
  // no need for desktop
  {
    name: 'changelog',
    disabled: isDesktop,
    paths: ['src/app/[variants]/@modal/(.)changelog', 'src/app/[variants]/(main)/changelog'],
  },
  {
    name: 'auth',
    disabled: isDesktop,
    paths: ['src/app/[variants]/(auth)'],
  },
  {
    name: 'mobile',
    disabled: isDesktop,
    paths: ['src/app/[variants]/(main)/(mobile)'],
  },
  {
    name: 'oauth',
    disabled: isDesktop,
    paths: ['src/app/[variants]/oauth', 'src/app/(backend)/oidc'],
  },
  {
    name: 'api-webhooks',
    disabled: isDesktop,
    paths: ['src/app/(backend)/api/webhooks'],
  },
  // no need for web
  {
    name: 'desktop-devtools',
    disabled: !isDesktop,
    paths: ['src/app/desktop'],
  },
  {
    name: 'desktop-trpc',
    disabled: !isDesktop,
    paths: ['src/app/(backend)/trpc/desktop'],
  },
];
/* eslint-enable */

/**
 * 删除指定的目录
 */
const removeDirectories = async () => {
  // 遍历 partialBuildPages 数组
  for (const page of partialBuildPages) {
    // 检查是否需要禁用该功能
    if (page.disabled) {
      for (const dirPath of page.paths) {
        const fullPath = path.resolve(process.cwd(), dirPath);

        // 检查目录是否存在
        if (existsSync(fullPath)) {
          try {
            // 递归删除目录
            await rm(fullPath, { force: true, recursive: true });
            console.log(`♻️ Removed ${dirPath} successfully`);
          } catch (error) {
            console.error(`Failed to remove directory ${dirPath}:`, error);
          }
        }
      }
    }
  }
};

// 执行删除操作
console.log('Starting prebuild cleanup...');
await removeDirectories();
console.log('Prebuild cleanup completed.');
