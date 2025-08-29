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

// Bedrock配置检查
const checkBedrockConfig = () => {
  const bearerToken = process.env.AWS_BEARER_TOKEN_BEDROCK;
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const enabledBedrock = process.env.ENABLED_AWS_BEDROCK === '1';
  
  // 只有在配置了相关参数或启用了Bedrock时才检查
  if (!bearerToken && !awsAccessKey && !awsSecretKey && !enabledBedrock) {
    return; // 没有任何Bedrock相关配置，跳过检查
  }
  
  if (awsAccessKey || awsSecretKey) {
    console.warn('⚠️  Deprecated AWS credentials detected and will be ignored:');
    if (awsAccessKey) console.warn('   - AWS_ACCESS_KEY_ID');
    if (awsSecretKey) console.warn('   - AWS_SECRET_ACCESS_KEY');
    console.warn('   Consider removing these variables');
  }

  if (!bearerToken) {
    console.warn('⚠️  AWS_BEARER_TOKEN_BEDROCK not configured');
    console.warn('   Set AWS_BEARER_TOKEN_BEDROCK to enable Bedrock');
    console.warn('   See: https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html');
    return;
  }

  if (bearerToken.length < 20) {
    console.error('❌ AWS_BEARER_TOKEN_BEDROCK appears invalid (too short)');
    process.exit(1);
  }
};

// 执行删除操作
console.log('Starting prebuild cleanup...');
await removeDirectories();
console.log('Prebuild cleanup completed.');

// 检查Bedrock配置
checkBedrockConfig();
