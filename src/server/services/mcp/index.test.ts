import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mcpService } from './index';

// 存储模拟的 exec 实现
const mockExecImpl = vi.fn();

// 模拟 child_process.exec
vi.mock('child_process', () => ({
  exec: vi.fn((cmd, callback) => {
    return mockExecImpl(cmd, callback);
  }),
}));

// 模拟 util.promisify
vi.mock('util', () => ({
  promisify: vi.fn((fn) => {
    return async (cmd: string) => {
      return new Promise((resolve, reject) => {
        mockExecImpl(cmd, (error: Error | null, result: any) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    };
  }),
}));

describe('McpCtr', () => {
  describe('checkMcpInstall', () => {
    // 测试场景1: NodeJS已安装且版本符合要求，npm包已安装
    it('应该检测到已安装的NodeJS和npm包', async () => {
      // 模拟命令执行返回值
      mockExecImpl.mockImplementation((cmd: string, callback: any) => {
        if (cmd === 'node --version') {
          callback(null, { stdout: 'v18.15.0' });
        } else if (cmd.includes('npm list -g')) {
          callback(null, { stdout: '/usr/local/lib\n└── mcp-server-apple-shortcuts@1.0.1' });
        } else if (cmd.includes('npx -y')) {
          callback(null, { stdout: '1.0.1' });
        }
      });

      const result = await mcpService.checkMcpInstall({
        id: 'recursechat/mcp-server-apple-shortcuts',
        manifest: {
          systemDependencies: [
            {
              name: 'nodejs',
              requiredVersion: '>=18',
            },
          ],
          installationMethod: 'npm',
          installationDetails: {
            packageName: 'mcp-server-apple-shortcuts',
          },
        },
      });

      expect(result.success).toBe(true);
      expect(result.systemDependencies?.[0]).toMatchObject({
        name: 'nodejs',
        installed: true,
        version: 'v18.15.0',
        meetRequirement: true,
      });
      expect(result.packageInstalled).toBe(true);
    });

    // 测试场景2: NodeJS已安装但版本不符合要求
    it('应该检测到NodeJS版本不符合要求', async () => {
      // 模拟命令执行返回值
      mockExecImpl.mockImplementation((cmd: string, callback: any) => {
        if (cmd === 'node --version') {
          callback(null, { stdout: 'v16.13.0' });
        } else if (cmd.includes('npm list -g')) {
          callback(null, { stdout: '(empty)' });
        } else if (cmd.includes('npx -y')) {
          callback(null, { stdout: '1.0.1' });
        }
      });

      const result = await mcpService.checkMcpInstall({
        id: 'recursechat/mcp-server-apple-shortcuts',
        manifest: {
          systemDependencies: [
            {
              name: 'nodejs',
              requiredVersion: '>=18',
            },
          ],
          installationMethod: 'npm',
          installationDetails: {
            packageName: 'mcp-server-apple-shortcuts',
          },
        },
      });

      expect(result.success).toBe(true);
      expect(result.systemDependencies?.[0]).toMatchObject({
        name: 'nodejs',
        installed: true,
        version: 'v16.13.0',
        meetRequirement: false,
      });
    });

    // 测试场景3: NodeJS未安装
    it('应该检测到NodeJS未安装', async () => {
      // 模拟命令执行返回值
      mockExecImpl.mockImplementation((cmd: string, callback: any) => {
        if (cmd === 'node --version') {
          callback(new Error('Command not found: node'), null);
        }
      });

      const result = await mcpService.checkMcpInstall({
        id: 'recursechat/mcp-server-apple-shortcuts',
        manifest: {
          systemDependencies: [
            {
              name: 'nodejs',
              requiredVersion: '>=18',
            },
          ],
          installationMethod: 'npm',
          installationDetails: {
            packageName: 'mcp-server-apple-shortcuts',
          },
        },
      });

      expect(result.success).toBe(true);
      expect(result.systemDependencies?.[0]).toMatchObject({
        name: 'nodejs',
        installed: false,
        meetRequirement: false,
      });
    });

    // 测试场景4: npm包未安装
    it('应该检测到npm包未安装', async () => {
      // 模拟命令执行返回值
      mockExecImpl.mockImplementation((cmd: string, callback: any) => {
        if (cmd === 'node --version') {
          callback(null, { stdout: 'v18.15.0' });
        } else if (cmd.includes('npm list -g')) {
          callback(null, { stdout: '(empty)' });
        } else if (cmd.includes('npx -y')) {
          callback(new Error('Command failed'), null);
        }
      });

      const result = await mcpService.checkMcpInstall({
        id: 'recursechat/mcp-server-apple-shortcuts',
        manifest: {
          systemDependencies: [
            {
              name: 'nodejs',
              requiredVersion: '>=18',
            },
          ],
          installationMethod: 'npm',
          installationDetails: {
            packageName: 'mcp-server-apple-shortcuts',
          },
        },
      });

      expect(result.success).toBe(true);
      expect(result.packageInstalled).toBe(false);
    });

    // 测试场景5: 不支持的依赖项
    it('应该标记不支持的依赖项', async () => {
      // 模拟命令执行返回值
      mockExecImpl.mockImplementation((cmd: string, callback: any) => {
        if (cmd === 'node --version') {
          callback(null, { stdout: 'v18.15.0' });
        }
      });

      const result = await mcpService.checkMcpInstall({
        id: 'recursechat/mcp-server-apple-shortcuts',
        manifest: {
          systemDependencies: [
            {
              name: 'nodejs',
              requiredVersion: '>=18',
            },
            {
              name: 'python',
              requiredVersion: '>=3.9',
            },
          ],
          installationMethod: 'npm',
          installationDetails: {
            packageName: 'mcp-server-apple-shortcuts',
          },
        },
      });

      expect(result.success).toBe(true);
      expect(result.systemDependencies?.length).toBe(2);
      expect(result.systemDependencies?.[1]).toMatchObject({
        name: 'python',
        installed: false,
        meetRequirement: false,
        error: '不支持的依赖项',
      });
    });

    // 测试场景6: 手动安装方法
    it('应该处理手动安装方法', async () => {
      // 模拟命令执行返回值
      mockExecImpl.mockImplementation((cmd: string, callback: any) => {
        if (cmd === 'node --version') {
          callback(null, { stdout: 'v18.15.0' });
        }
      });

      const result = await mcpService.checkMcpInstall({
        id: 'recursechat/mcp-server-apple-shortcuts',
        manifest: {
          systemDependencies: [
            {
              name: 'nodejs',
              requiredVersion: '>=18',
            },
          ],
          installationMethod: 'manual',
          installationDetails: {
            repositoryUrlToClone: 'git@github.com:recursechat/mcp-server-apple-shortcuts.git',
            setupSteps: [
              'git clone git@github.com:recursechat/mcp-server-apple-shortcuts.git',
              'npm install',
              'npm run build',
            ],
          },
        },
      });

      expect(result.success).toBe(true);
      expect(result.packageInstalled).toBe(false);
    });

    // 测试场景7: 处理异常情况
    it('应该处理执行过程中的异常', async () => {
      // 模拟命令执行抛出异常
      mockExecImpl.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await mcpService.checkMcpInstall({
        id: 'recursechat/mcp-server-apple-shortcuts',
        manifest: {
          systemDependencies: [
            {
              name: 'nodejs',
              requiredVersion: '>=18',
            },
          ],
          installationMethod: 'npm',
          installationDetails: {
            packageName: 'mcp-server-apple-shortcuts',
          },
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected error');
    });
  });
});
