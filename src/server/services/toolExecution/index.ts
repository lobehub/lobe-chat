import { ChatToolPayload } from '@lobechat/types';
import debug from 'debug';

import { MCPService } from '../mcp';
import { PluginGatewayService } from '../pluginGateway';
import { BuiltinToolsExecutor } from './builtin';
import { ToolExecutionContext, ToolExecutionResult, ToolExecutionResultResponse } from './types';

const log = debug('lobe-server:tool-execution-service');

interface ToolExecutionServiceDeps {
  builtinToolsExecutor: BuiltinToolsExecutor;
  mcpService: MCPService;
  pluginGatewayService: PluginGatewayService;
}

export class ToolExecutionService {
  private builtinToolsExecutor: BuiltinToolsExecutor;
  private mcpService: MCPService;
  private pluginGatewayService: PluginGatewayService;

  constructor({
    mcpService,
    pluginGatewayService,
    builtinToolsExecutor,
  }: ToolExecutionServiceDeps) {
    this.builtinToolsExecutor = builtinToolsExecutor;
    this.mcpService = mcpService;
    this.pluginGatewayService = pluginGatewayService;
  }

  async executeTool(
    payload: ChatToolPayload,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResultResponse> {
    const { identifier, apiName, type } = payload;

    log('Executing tool: %s:%s (type: %s)', identifier, apiName, type);

    const startTime = Date.now();
    try {
      const typeStr = type as string;
      let data: ToolExecutionResult;
      switch (typeStr) {
        case 'builtin': {
          data = await this.builtinToolsExecutor.execute(payload, context);
          break;
        }
        case 'plugin':
        case 'customPlugin': {
          const result = await this.pluginGatewayService.execute(payload, context);
          data = {
            content: (result as any).content,
            error: (result as any).error,
            success: result.success,
          };
          break;
        }
        case 'mcp': {
          data = await this.executeMCPTool(payload, context);
          break;
        }
        default: {
          throw new Error(`Unknown tool type for tool execution: ${typeStr}`);
        }
      }

      const executionTime = Date.now() - startTime;

      return {
        ...data,
        executionTime,
      };

      // Handle MCP and other types (default, standalone, markdown, mcp)
    } catch (error) {
      const executionTime = Date.now() - startTime;
      log('Error executing tool %s:%s: %O', identifier, apiName, error);
      return {
        content: (error as Error).message,
        error: {
          message: (error as Error).message,
        },
        executionTime,
        success: false,
      };
    }
  }

  private async executeMCPTool(
    payload: ChatToolPayload,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    // TODO: Need to determine where to get MCP client params from
    // For now, we assume it's stored in the tool's metadata or needs to be fetched
    // This is a placeholder implementation
    log(
      'MCP tool execution not yet fully implemented for: %s:%s',
      payload.identifier,
      payload.apiName,
      context,
    );

    // For now, return an error indicating MCP tools need additional context
    return {
      content: 'MCP tool execution requires client connection parameters',
      error: {
        code: 'MCP_NOT_IMPLEMENTED',
        message: 'MCP tool execution requires client connection parameters',
      },
      success: false,
    };

    // Future implementation would look like:
    // const mcpParams = await this.getMCPParams(payload.identifier);
    // const result = await this.mcpService.callTool(
    //   mcpParams,
    //   payload.apiName,
    //   payload.arguments
    // );
    // return { success: true, data: result };
  }
}

export * from './types';
