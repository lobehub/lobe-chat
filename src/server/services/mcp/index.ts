import { LobeChatPluginApi, LobeChatPluginManifest, PluginSchema } from '@lobehub/chat-plugin-sdk';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { MCPClient, MCPClientParams, StdioMCPParams } from '@/libs/mcp';
import { CheckMcpInstallParams, CheckMcpInstallResult } from '@/types/plugins';
import { CustomPluginMetadata } from '@/types/tool/plugin';
import { safeParseJSON } from '@/utils/safeParseJSON';

const execPromise = promisify(exec);

const log = debug('lobe-mcp:service');

class MCPService {
  // --- MCP Interaction ---

  // listTools now accepts MCPClientParams
  async listTools(params: MCPClientParams): Promise<LobeChatPluginApi[]> {
    const client = await this.getClient(params); // Get client using params
    log(`Listing tools using client for params: %O`, params);

    try {
      const result = await client.listTools();
      log(`Tools listed successfully for params: %O, result count: %d`, params, result.length);
      return result.map<LobeChatPluginApi>((item) => ({
        // Assuming identifier is the unique name/id
        description: item.description,
        name: item.name,
        parameters: item.inputSchema as PluginSchema,
      }));
    } catch (error) {
      console.error(`Error listing tools for params %O:`, params, error);
      // Propagate a TRPCError for better handling upstream
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Error listing tools from MCP server: ${(error as Error).message}`,
      });
    }
  }

  // callTool now accepts MCPClientParams, toolName, and args
  async callTool(params: MCPClientParams, toolName: string, argsStr: any): Promise<any> {
    const client = await this.getClient(params); // Get client using params

    const args = safeParseJSON(argsStr);

    log(`Calling tool "${toolName}" using client for params: %O with args: %O`, params, args);

    try {
      // Delegate the call to the MCPClient instance
      const result = await client.callTool(toolName, args); // Pass args directly
      log(`Tool "${toolName}" called successfully for params: %O, result: %O`, params, result);
      const { content, isError } = result;

      if (isError) return result;

      const data = content as { text: string; type: 'text' }[];

      const text = data?.[0]?.text;

      if (!text) return data;

      // try to get json object, which will be stringify in the client
      const json = safeParseJSON(text);
      if (json) return json;

      return text;
    } catch (error) {
      if (error instanceof McpError) {
        const mcpError = error as McpError;

        return mcpError.message;
      }

      console.error(`Error calling tool "${toolName}" for params %O:`, params, error);
      // Propagate a TRPCError
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Error calling tool "${toolName}" on MCP server: ${(error as Error).message}`,
      });
    }
  }

  // TODO: Consider adding methods for managing the client lifecycle if needed,
  // e.g., explicitly closing clients on shutdown or after inactivity,
  // although for serverless, on-demand creation/retrieval might be sufficient.

  // TODO: Implement methods like listResources, getResource, listPrompts, getPrompt if needed,
  // following the pattern of accepting MCPClientParams.

  // --- Client Management (Replaces Connection Management) ---

  // Private method to get or initialize a client based on parameters
  private async getClient(params: MCPClientParams): Promise<MCPClient> {
    try {
      // Ensure stdio is only attempted in desktop/server environments within the client itself
      // or add a check here if MCPClient doesn't handle it.
      // Example check (adjust based on where environment check is best handled):
      // if (params.type === 'stdio' && typeof window !== 'undefined') {
      //   throw new Error('Stdio MCP type is not supported in browser environment.');
      // }

      const client = new MCPClient(params);
      await client.initialize({
        onProgress: (progress) => {
          log(`New client initializing... ${progress.progress}/${progress.total}`);
        },
      }); // Initialization logic should be within MCPClient
      log(`New client initialized`);
      return client;
    } catch (error) {
      console.error(`Failed to initialize MCP client`, error);
      // Do not cache failed initializations
      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to initialize MCP client, reason: ${(error as Error).message}`,
      });
    }
  }

  async getStreamableMcpServerManifest(
    identifier: string,
    url: string,
    metadata?: CustomPluginMetadata,
  ): Promise<LobeChatPluginManifest> {
    const tools = await this.listTools({ name: identifier, type: 'http', url }); // Get client using params

    return {
      api: tools,
      identifier,
      meta: {
        avatar: metadata?.avatar || 'MCP_AVATAR',
        description:
          metadata?.description ||
          `${identifier} MCP server has ${tools.length} tools, like "${tools[0]?.name}"`,
        title: identifier,
      },
      // TODO: temporary
      type: 'mcp' as any,
    };
  }

  async getStdioMcpServerManifest(
    params: Omit<StdioMCPParams, 'type'>,
    metadata?: CustomPluginMetadata,
  ): Promise<LobeChatPluginManifest> {
    const tools = await this.listTools({
      args: params.args,
      command: params.command,
      env: params.env,
      name: params.name,
      type: 'stdio',
    });

    const identifier = params.name;
    return {
      api: tools,
      identifier,
      meta: {
        avatar: metadata?.avatar || 'MCP_AVATAR',
        description:
          metadata?.description ||
          `${identifier} MCP server has ${tools.length} tools, like "${tools[0]?.name}"`,
        title: identifier,
      },
      // TODO: temporary
      type: 'mcp' as any,
    };
  }

  /**
   * 检查系统依赖版本
   */
  private async checkSystemDependency(dependency: {
    checkCommand?: string;
    name: string;
    requiredVersion?: string;
    type?: string;
    versionParsingRequired?: boolean;
  }): Promise<{ error?: string; installed: boolean; meetRequirement: boolean; version?: string }> {
    try {
      // 如果没有提供检查命令，则使用通用命令
      const checkCommand = dependency.checkCommand || `${dependency.name} --version`;

      const { stdout, stderr } = await execPromise(checkCommand);
      if (stderr && !stdout) {
        return {
          error: stderr,
          installed: false,
          meetRequirement: false,
        };
      }

      const output = stdout.trim();
      let version = output;

      // 处理版本解析
      if (dependency.versionParsingRequired) {
        // 提取版本号 - 通常格式为 vX.Y.Z 或 X.Y.Z
        const versionMatch = output.match(/[Vv]?(\d+(\.\d+)*)/);
        if (versionMatch) {
          version = versionMatch[0];
        }
      }

      let meetRequirement = true;

      if (dependency.requiredVersion) {
        // 提取数字部分
        const currentVersion = version.replace(/^[Vv]/, ''); // 移除可能的 v 前缀
        const currentVersionNum = parseFloat(currentVersion);

        // 从要求版本中提取条件和数字
        const requirementMatch = dependency.requiredVersion.match(/([<=>]+)?(\d+(\.\d+)*)/);

        if (requirementMatch) {
          const [, operator = '=', requiredVersion] = requirementMatch;
          const requiredNum = parseFloat(requiredVersion);

          switch (operator) {
            case '>=': {
              meetRequirement = currentVersionNum >= requiredNum;
              break;
            }
            case '>': {
              meetRequirement = currentVersionNum > requiredNum;
              break;
            }
            case '<=': {
              meetRequirement = currentVersionNum <= requiredNum;
              break;
            }
            case '<': {
              meetRequirement = currentVersionNum < requiredNum;
              break;
            }
            default: {
              // 默认为等于
              meetRequirement = currentVersionNum === requiredNum;
              break;
            }
          }
        }
      }

      return {
        installed: true,
        meetRequirement,
        version,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : '未知错误',
        installed: false,
        meetRequirement: false,
      };
    }
  }

  /**
   * 检查 npm 包是否已安装
   */
  private async checkNpmPackageInstalled(packageName: string): Promise<boolean> {
    try {
      // 使用 npm list 检查包是否已全局安装
      const { stdout: globalStdout } = await execPromise(`npm list -g ${packageName} --depth=0`);
      if (!globalStdout.includes('(empty)') && globalStdout.includes(packageName)) {
        return true;
      }

      // 检查包是否可以通过 npx 直接使用（这也能验证包是否可用）
      await execPromise(`npx -y ${packageName} --version`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查 MCP 插件安装状态
   */
  async checkMcpInstall(manifest: CheckMcpInstallParams): Promise<CheckMcpInstallResult> {
    try {
      const systemDependenciesResults = [];

      // 检查系统依赖
      if (manifest.systemDependencies && manifest.systemDependencies.length > 0) {
        for (const dep of manifest.systemDependencies) {
          const result = await this.checkSystemDependency(dep);
          systemDependenciesResults.push({
            name: dep.name,
            ...result,
          });
        }
      }

      // 检查 npm 包是否已安装
      let packageInstalled = false;
      if (manifest.installationMethod === 'npm' && manifest.installationDetails.packageName) {
        packageInstalled = await this.checkNpmPackageInstalled(
          manifest.installationDetails.packageName,
        );
      } else if (
        manifest.installationMethod === 'manual' &&
        manifest.installationDetails.repositoryUrlToClone
      ) {
        // 对于手动安装，我们只能检查用户是否遵循了指南，但无法确认
        // 这里简单返回 false，实际使用时用户需要手动确认
        packageInstalled = false;
      }

      // 检查系统依赖是否都满足要求
      const allDependenciesMet = systemDependenciesResults.every((dep) => dep.meetRequirement);

      return {
        allDependenciesMet,
        packageInstalled,
        success: true,
        systemDependencies: systemDependenciesResults,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : '检查 MCP 插件安装状态时发生未知错误',
        success: false,
      };
    }
  }
}

// Export a singleton instance
export const mcpService = new MCPService();
