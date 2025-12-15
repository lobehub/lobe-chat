import { BuiltinServerRuntimeOutput } from '@lobechat/types';

import {
  EditLocalFileState,
  GetCommandOutputState,
  GlobFilesState,
  GrepContentState,
  KillCommandState,
  ListLocalFilesState,
  MoveLocalFilesState,
  ReadLocalFileState,
  RenameLocalFileState,
  RunCommandState,
  SearchLocalFilesState,
  WriteLocalFileState,
} from '../type';

/**
 * Cloud Code Interpreter Execution Runtime
 *
 * This runtime executes tools via the LobeHub Market SDK's runBuildInTool API,
 * which connects to AWS Bedrock AgentCore Code Interpreter sandbox.
 *
 * Session Management:
 * - Sessions are automatically created per userId + topicId combination
 * - Sessions are recreated automatically if expired
 * - The sessionExpiredAndRecreated flag indicates if recreation occurred
 */

interface ExecutionContext {
  topicId: string;
  userId: string;
}

// Types for tool parameters matching market-sdk
interface ListLocalFilesParams {
  directoryPath: string;
}

interface ReadLocalFileParams {
  endLine?: number;
  path: string;
  startLine?: number;
}

interface WriteLocalFileParams {
  content: string;
  createDirectories?: boolean;
  path: string;
}

interface EditLocalFileParams {
  all?: boolean;
  path: string;
  replace: string;
  search: string;
}

interface SearchLocalFilesParams {
  directory: string;
  fileType?: string;
  keyword?: string;
  modifiedAfter?: string;
  modifiedBefore?: string;
}

interface MoveLocalFilesParams {
  operations: Array<{
    destination: string;
    source: string;
  }>;
}

interface RenameLocalFileParams {
  newName: string;
  oldPath: string;
}

interface RunCommandParams {
  background?: boolean;
  command: string;
  timeout?: number;
}

interface GetCommandOutputParams {
  commandId: string;
}

interface KillCommandParams {
  commandId: string;
}

interface GrepContentParams {
  directory: string;
  filePattern?: string;
  pattern: string;
  recursive?: boolean;
}

interface GlobLocalFilesParams {
  directory?: string;
  pattern: string;
}

export class CodeInterpreterExecutionRuntime {
  private context: ExecutionContext;

  constructor(context: ExecutionContext) {
    this.context = context;
  }

  // ==================== File Operations ====================

  async listLocalFiles(args: ListLocalFilesParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('listLocalFiles', args);

      const state: ListLocalFilesState = {
        files: result.result?.files || [],
      };

      return {
        content: JSON.stringify(result.result),
        state,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async readLocalFile(args: ReadLocalFileParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('readLocalFile', args);

      const state: ReadLocalFileState = {
        content: result.result?.content || '',
        endLine: args.endLine,
        path: args.path,
        startLine: args.startLine,
        totalLines: result.result?.totalLines,
      };

      return {
        content: JSON.stringify(result.result),
        state,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async writeLocalFile(args: WriteLocalFileParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('writeLocalFile', args);

      const state: WriteLocalFileState = {
        bytesWritten: result.result?.bytesWritten,
        path: args.path,
        success: result.success,
      };

      return {
        content: JSON.stringify({
          message: `Successfully wrote to ${args.path}`,
          success: true,
        }),
        state,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async editLocalFile(args: EditLocalFileParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('editLocalFile', args);

      const state: EditLocalFileState = {
        diffText: result.result?.diffText,
        linesAdded: result.result?.linesAdded,
        linesDeleted: result.result?.linesDeleted,
        path: args.path,
        replacements: result.result?.replacements || 0,
      };

      const statsText =
        state.linesAdded || state.linesDeleted
          ? ` (+${state.linesAdded || 0} -${state.linesDeleted || 0})`
          : '';

      return {
        content: `Successfully replaced ${state.replacements} occurrence(s) in ${args.path}${statsText}`,
        state,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async searchLocalFiles(args: SearchLocalFilesParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('searchLocalFiles', args);

      const state: SearchLocalFilesState = {
        results: result.result?.results || [],
        totalCount: result.result?.totalCount || 0,
      };

      return {
        content: JSON.stringify(result.result),
        state,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async moveLocalFiles(args: MoveLocalFilesParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('moveLocalFiles', args);

      const state: MoveLocalFilesState = {
        results: result.result?.results || [],
        successCount: result.result?.successCount || 0,
        totalCount: args.operations.length,
      };

      return {
        content: JSON.stringify({
          message: `Moved ${state.successCount}/${state.totalCount} items`,
          results: state.results,
        }),
        state,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async renameLocalFile(args: RenameLocalFileParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('renameLocalFile', args);

      const state: RenameLocalFileState = {
        error: result.result?.error,
        newPath: result.result?.newPath || '',
        oldPath: args.oldPath,
        success: result.success,
      };

      return {
        content: JSON.stringify({
          message: `Successfully renamed ${args.oldPath} to ${args.newName}`,
          success: true,
        }),
        state,
        success: result.success,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Shell Commands ====================

  async runCommand(args: RunCommandParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('runCommand', args);

      const state: RunCommandState = {
        commandId: result.result?.commandId,
        error: result.result?.error,
        exitCode: result.result?.exitCode,
        isBackground: args.background || false,
        output: result.result?.output,
        stderr: result.result?.stderr,
        success: result.success,
      };

      return {
        content: JSON.stringify(result.result),
        state,
        success: result.success,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCommandOutput(args: GetCommandOutputParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('getCommandOutput', args);

      const state: GetCommandOutputState = {
        error: result.result?.error,
        newOutput: result.result?.newOutput,
        running: result.result?.running ?? false,
        success: result.success,
      };

      return {
        content: JSON.stringify(result.result),
        state,
        success: result.success,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async killCommand(args: KillCommandParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('killCommand', args);

      const state: KillCommandState = {
        commandId: args.commandId,
        error: result.result?.error,
        success: result.success,
      };

      return {
        content: JSON.stringify({
          message: `Successfully killed command: ${args.commandId}`,
          success: true,
        }),
        state,
        success: result.success,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Search & Find ====================

  async grepContent(args: GrepContentParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('grepContent', args);

      const state: GrepContentState = {
        matches: result.result?.matches || [],
        pattern: args.pattern,
        totalMatches: result.result?.totalMatches || 0,
      };

      return {
        content: JSON.stringify(result.result),
        state,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async globLocalFiles(args: GlobLocalFilesParams): Promise<BuiltinServerRuntimeOutput> {
    try {
      const result = await this.callTool('globLocalFiles', args);

      const state: GlobFilesState = {
        files: result.result?.files || [],
        pattern: args.pattern,
        totalCount: result.result?.totalCount || 0,
      };

      return {
        content: JSON.stringify(result.result),
        state,
        success: true,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Call a tool via the market SDK
   * This is a placeholder that will be connected to the actual SDK
   */
  private async callTool(
    toolName: string,
    params: Record<string, any>,
  ): Promise<{ result: any; sessionExpiredAndRecreated?: boolean; success: boolean }> {
    // TODO: Implement actual market-sdk integration
    // This will be replaced with:
    // const sdk = getMarketSDK();
    // return sdk.plugins.runBuildInTool(toolName, params, this.context);

    // For now, throw an error indicating SDK not configured
    throw new Error(
      `Cloud Code Interpreter not configured. Tool: ${toolName}, Context: ${JSON.stringify(this.context)}`,
    );
  }

  private handleError(error: unknown): BuiltinServerRuntimeOutput {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: errorMessage,
      error,
      success: false,
    };
  }
}
