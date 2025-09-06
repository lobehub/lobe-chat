/* eslint-disable unicorn/no-process-exit, unicorn/prefer-top-level-await */
import fs from 'fs-extra';
import path from 'node:path';
import { parse, stringify } from 'yaml';

interface LatestMacYml {
  files: Array<{
    sha512: string;
    size: number;
    url: string;
  }>;
  path: string;
  releaseDate: string;
  sha512: string;
  version: string;
}

// 配置
const RELEASE_TAG = process.env.RELEASE_TAG || process.argv[2];
const FILE_NAME = 'latest-mac.yml';
const RELEASE_DIR = path.resolve('release');

// 验证环境变量和输入
if (!RELEASE_TAG) {
  console.error('❌ RELEASE_TAG environment variable or argument is required');
  process.exit(1);
}

// 验证 release tag 格式
if (!/^v?\d+\.\d+\.\d+/.test(RELEASE_TAG)) {
  console.error(`❌ Invalid RELEASE_TAG format: ${RELEASE_TAG}. Expected format: v1.2.3`);
  process.exit(1);
}

/**
 * 检测 latest-mac.yml 文件的平台类型
 */
function detectPlatform(yamlContent: LatestMacYml): 'x64' | 'arm64' | 'both' | 'none' {
  const hasX64 = yamlContent.files.some((file) => file.url.includes('-x64.dmg'));
  const hasArm64 = yamlContent.files.some((file) => file.url.includes('-arm64.dmg'));

  if (hasX64 && hasArm64) return 'both';
  if (hasX64 && !hasArm64) return 'x64';
  if (!hasX64 && hasArm64) return 'arm64';
  return 'none';
}

/**
 * 合并两个 latest-mac.yml 文件
 * @param x64Content x64 平台的 YAML 内容
 * @param arm64Content ARM64 平台的 YAML 内容
 */
function mergeYamlFiles(x64Content: LatestMacYml, arm64Content: LatestMacYml): string {
  // 以 x64 为基础（保持兼容性）
  const merged: LatestMacYml = {
    ...x64Content,
    files: [...x64Content.files, ...arm64Content.files],
  };

  // 使用 yaml 库生成，保持 sha512 在同一行
  return stringify(merged, {
    lineWidth: 0, // 不换行
  });
}

// GitHub API functions removed since we're working with local files only

/**
 * 读取本地文件
 */
function readLocalFile(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`✅ Read local file: ${filePath} (${content.length} chars)`);
      return content;
    }
    console.log(`⚠️  Local file not found: ${filePath}`);
    return null;
  } catch (error) {
    console.error(`❌ Error reading local file ${filePath}:`, error);
    return null;
  }
}

/**
 * 写入本地文件
 */
function writeLocalFile(filePath: string, content: string): void {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Written local file: ${filePath} (${content.length} chars)`);
  } catch (error) {
    console.error(`❌ Error writing local file ${filePath}:`, error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    console.log(`🚀 Starting macOS Release file merge for ${RELEASE_TAG}`);
    console.log(`📁 Working directory: ${RELEASE_DIR}`);

    // 1. 检查 release 目录下的所有文件
    const releaseFiles = fs.readdirSync(RELEASE_DIR);
    console.log(`📂 Files in release directory: ${releaseFiles.join(', ')}`);

    // 2. 查找所有 latest-mac*.yml 文件
    const macYmlFiles = releaseFiles.filter(
      (f) => f.startsWith('latest-mac') && f.endsWith('.yml'),
    );
    console.log(`🔍 Found macOS YAML files: ${macYmlFiles.join(', ')}`);

    if (macYmlFiles.length === 0) {
      console.log('⚠️  No macOS YAML files found, skipping merge');
      return;
    }

    // 3. 处理找到的文件，识别平台
    const macFiles: Array<{
      content: string;
      filename: string;
      platform: 'x64' | 'arm64';
      yaml: LatestMacYml;
    }> = [];

    for (const fileName of macYmlFiles) {
      const filePath = path.join(RELEASE_DIR, fileName);
      const content = readLocalFile(filePath);

      if (!content) continue;

      try {
        const yamlContent = parse(content) as LatestMacYml;
        const platform = detectPlatform(yamlContent);

        if (platform === 'x64' || platform === 'arm64') {
          macFiles.push({ content, filename: fileName, platform, yaml: yamlContent });
          console.log(`🔍 Detected ${platform} platform in ${fileName}`);
        } else if (platform === 'both') {
          console.log(`✅ Found already merged file: ${fileName}`);
          // 如果已经是合并后的文件，直接复制为最终文件
          writeLocalFile(path.join(RELEASE_DIR, FILE_NAME), content);
          return;
        } else {
          console.log(`⚠️  Unknown platform type: ${platform} in ${fileName}`);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to parse ${fileName}:`, error);
      }
    }

    // 4. 检查是否有两个不同平台的文件
    const x64Files = macFiles.filter((f) => f.platform === 'x64');
    const arm64Files = macFiles.filter((f) => f.platform === 'arm64');

    if (x64Files.length === 0 && arm64Files.length === 0) {
      console.log('⚠️  No valid platform files found');
      return;
    }

    if (x64Files.length === 0) {
      console.log('⚠️  No x64 files found, using ARM64 only');
      writeLocalFile(path.join(RELEASE_DIR, FILE_NAME), arm64Files[0].content);
      return;
    }

    if (arm64Files.length === 0) {
      console.log('⚠️  No ARM64 files found, using x64 only');
      writeLocalFile(path.join(RELEASE_DIR, FILE_NAME), x64Files[0].content);
      return;
    }

    // 5. 合并 x64 和 ARM64 文件
    const x64File = x64Files[0];
    const arm64File = arm64Files[0];

    console.log(`🔄 Merging ${x64File.filename} (x64) and ${arm64File.filename} (ARM64)...`);
    const mergedContent = mergeYamlFiles(x64File.yaml, arm64File.yaml);

    // 6. 保存合并后的文件
    const mergedFilePath = path.join(RELEASE_DIR, FILE_NAME);
    writeLocalFile(mergedFilePath, mergedContent);

    // 7. 验证合并结果
    const mergedYaml = parse(mergedContent) as LatestMacYml;
    const finalPlatform = detectPlatform(mergedYaml);

    if (finalPlatform === 'both') {
      console.log('✅ Successfully merged both x64 and ARM64 platforms');
      console.log(`📊 Final file contains ${mergedYaml.files.length} files`);
    } else {
      console.warn(`⚠️  Merge result unexpected: ${finalPlatform}`);
    }

    console.log('🎉 Merge complete!');
  } catch (error) {
    console.error('❌ Error during merge:', error);
    process.exit(1);
  }
}

// 运行主函数
void main();
