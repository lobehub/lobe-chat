import { ClaudeCodeMessage, ClaudeCodeOptions } from '@lobechat/electron-client-ipc';

/**
 * Claude Code Query Parameters
 */
export interface ClaudeCodeQueryParams {
  abortController?: AbortController;
  options?: ClaudeCodeOptions;
  prompt: string;
}

/**
 * Claude Code Streaming Parameters
 */
export interface ClaudeCodeStreamingParams extends ClaudeCodeQueryParams {
  streamId: string;
}

/**
 * Claude Code Service Implementation Abstract Class
 */
export abstract class ClaudeCodeImpl {
  /**
   * Execute Claude Code query
   * @param params Query parameters
   * @returns AsyncGenerator of ClaudeCodeMessage
   */
  abstract query(params: ClaudeCodeQueryParams): AsyncGenerator<ClaudeCodeMessage>;

  /**
   * Check Claude Code availability
   * @returns Promise with availability status
   */
  abstract checkAvailability(): Promise<{
    apiKeySource?: string;
    available: boolean;
    error?: string;
    version?: string;
  }>;
  /**
   * Clean up resources
   */
  abstract cleanup(): void;
}

/**
 * Claude Code Process Options
 */
export interface ClaudeCodeProcessOptions {
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
  executable?: string;
  executableArgs?: string[];
  pathToClaudeCodeExecutable?: string;
}

/**
 * Claude Code Process Result
 */
export interface ClaudeCodeProcessResult {
  exitCode: number;
  killed: boolean;
  signal?: string;
}

/**
 * Claude Code Runtime Configuration
 */
export interface ClaudeCodeRuntimeConfig {
  debugMode?: boolean;
  maxMemoryUsage?: number;
  timeoutMs?: number;
}
