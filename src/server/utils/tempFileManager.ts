import { mkdtempSync, rmSync , writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';

/**
 * 安全存储临时文件工具类
 */
export class TempFileManager {
  private readonly tempDir: string;
  private filePaths: Set<string> = new Set();

  constructor() {
    // 创建唯一临时目录 (跨平台安全)
    this.tempDir = mkdtempSync(join(tmpdir(), 'epub-'));
    // 注册退出清理钩子
    this.registerCleanupHook();
  }

  /**
   * 将 Uint8Array 写入临时文件
   * @param data 文件数据
   * @param ext 文件扩展名 (默认 .epub)
   * @returns 临时文件绝对路径
   */
  async writeTempFile(data: Uint8Array, ext = '.epub'): Promise<string> {
    const filePath = join(this.tempDir, `${uuidv4()}${ext}`);

    try {
      writeFileSync(filePath, data);
      this.filePaths.add(filePath);
      return filePath;
    } catch (error) {
      this.cleanup(); // 写入失败时立即清理
      throw new Error(`Failed to write temp file: ${(error as Error).message}`);
    }
  }

  /**
   * 安全清理临时资源
   */
  cleanup(): void {
    if (existsSync(this.tempDir)) {
      // 递归删除目录及内容
      rmSync(this.tempDir, { force: true, recursive: true });
      this.filePaths.clear();
    }
  }

  /**
   * 注册进程退出/异常时的自动清理
   */
  private registerCleanupHook(): void {
    // 正常退出
    process.on('exit', () => this.cleanup());
    // 异常退出
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception, cleaning temp files:', err);
      this.cleanup();
      process.exit(1);
    });
    // 信号终止
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, () => {
        this.cleanup();
        process.exit(0);
      });
    });
  }
}
