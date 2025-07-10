interface InputSchema {
  [k: string]: unknown;

  properties?: unknown | null;
  type: 'object';
}

export interface McpTool {
  description: string;
  inputSchema: InputSchema;
  name: string;
}

export interface McpResource {
  description?: string;
  mimeType?: string;
  name: string;
  uri: string;
}

export interface McpPromptArgument {
  description?: string;
  name: string;
  required?: boolean;
}

export interface McpPrompt {
  arguments?: McpPromptArgument[];
  description?: string;
  name: string;
}

interface HttpMCPClientParams {
  name: string;
  type: 'http';
  url: string;
}

export interface StdioMCPParams {
  args: string[];
  command: string;
  env?: Record<string, string>;
  name: string;
  type: 'stdio';
}

export type MCPClientParams = HttpMCPClientParams | StdioMCPParams;

export interface MCPErrorData {
  message: string;
  /**
   * 结构化的错误元数据
   */
  metadata?: {
    errorLog?: string;

    /**
     * 原始错误信息
     */
    originalError?: string;
    /**
     * MCP 连接参数
     */
    params?: {
      args?: string[];
      command?: string;
      type?: string;
    };

    /**
     * 进程相关信息
     */
    process?: {
      exitCode?: number;
      signal?: string;
    };

    /**
     * 错误发生的步骤
     */
    step?: string;

    /**
     * 时间戳
     */
    timestamp?: number;
  };

  /**
   * 错误类型
   */
  type:
    | 'CONNECTION_FAILED'
    | 'PROCESS_SPAWN_ERROR'
    | 'INITIALIZATION_TIMEOUT'
    | 'VALIDATION_ERROR'
    | 'UNKNOWN_ERROR';
}

/**
 * 结构化的 MCP 错误信息
 */
export interface MCPError extends Error {
  data: MCPErrorData;
}

/**
 * 创建结构化的 MCP 错误
 */
export function createMCPError(
  type: MCPErrorData['type'],
  message: string,
  metadata?: MCPErrorData['metadata'],
): MCPError {
  const error = new Error(message) as MCPError;

  error.data = {
    message,
    metadata: {
      timestamp: Date.now(),
      ...metadata,
    },
    type,
  };

  return error;
}
