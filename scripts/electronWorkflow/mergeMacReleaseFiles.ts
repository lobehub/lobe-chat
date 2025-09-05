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
function detectPlatform(yamlContent: LatestMacYml): 'intel' | 'arm' | 'both' | 'none' {
  const hasIntel = yamlContent.files.some((file) => file.url.includes('-x64.dmg'));
  const hasArm = yamlContent.files.some((file) => file.url.includes('-arm64.dmg'));

  if (hasIntel && hasArm) return 'both';
  if (hasIntel && !hasArm) return 'intel';
  if (!hasIntel && hasArm) return 'arm';
  return 'none';
}

/**
 * 合并两个 latest-mac.yml 文件
 * @param intelContent Intel 平台的 YAML 内容
 * @param armContent ARM 平台的 YAML 内容
 */
function mergeYamlFiles(intelContent: LatestMacYml, armContent: LatestMacYml): string {
  // 以 Intel 为基础（保持兼容性）
  const merged: LatestMacYml = {
    ...intelContent,
    files: [...intelContent.files, ...armContent.files],
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
      platform: 'intel' | 'arm';
      yaml: LatestMacYml;
    }> = [];

    for (const fileName of macYmlFiles) {
      const filePath = path.join(RELEASE_DIR, fileName);
      const content = readLocalFile(filePath);

      if (!content) continue;

      try {
        const yamlContent = parse(content) as LatestMacYml;
        const platform = detectPlatform(yamlContent);

        if (platform === 'intel' || platform === 'arm') {
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
    const intelFiles = macFiles.filter((f) => f.platform === 'intel');
    const armFiles = macFiles.filter((f) => f.platform === 'arm');

    if (intelFiles.length === 0 && armFiles.length === 0) {
      console.log('⚠️  No valid platform files found');
      return;
    }

    if (intelFiles.length === 0) {
      console.log('⚠️  No Intel files found, using ARM only');
      writeLocalFile(path.join(RELEASE_DIR, FILE_NAME), armFiles[0].content);
      return;
    }

    if (armFiles.length === 0) {
      console.log('⚠️  No ARM files found, using Intel only');
      writeLocalFile(path.join(RELEASE_DIR, FILE_NAME), intelFiles[0].content);
      return;
    }

    // 5. 合并 Intel 和 ARM 文件
    const intelFile = intelFiles[0];
    const armFile = armFiles[0];

    console.log(`🔄 Merging ${intelFile.filename} (Intel) and ${armFile.filename} (ARM)...`);
    const mergedContent = mergeYamlFiles(intelFile.yaml, armFile.yaml);

    // 6. 保存合并后的文件
    const mergedFilePath = path.join(RELEASE_DIR, FILE_NAME);
    writeLocalFile(mergedFilePath, mergedContent);

    // 7. 验证合并结果
    const mergedYaml = parse(mergedContent) as LatestMacYml;
    const finalPlatform = detectPlatform(mergedYaml);

    if (finalPlatform === 'both') {
      console.log('✅ Successfully merged both Intel and ARM platforms');
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
