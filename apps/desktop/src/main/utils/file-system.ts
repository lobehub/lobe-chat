import { mkdirSync, statSync } from 'node:fs';

export const makeSureDirExist = (dir: string) => {
  try {
    statSync(dir);
  } catch {
    // 使用 recursive: true，如果目录已存在则此操作无效果，如果不存在则创建
    try {
      mkdirSync(dir, { recursive: true });
    } catch (mkdirError: any) {
      // 如果创建目录失败（例如权限问题），则抛出错误
      throw new Error(`Could not create target directory: ${dir}. Error: ${mkdirError.message}`);
    }
  }
};
