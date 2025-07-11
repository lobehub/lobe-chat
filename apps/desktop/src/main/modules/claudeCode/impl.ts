import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface, type Interface } from 'node:readline';
import { promisify } from 'node:util';

import { ClaudeCodeMessage, ClaudeCodeOptions } from '@lobechat/electron-client-ipc';

import { createLogger } from '@/utils/logger';

import {
  ClaudeCodeImpl,
  ClaudeCodeProcessOptions,
  ClaudeCodeProcessResult,
  ClaudeCodeQueryParams,
  ClaudeCodeRuntimeConfig,
} from './type';

const logger = createLogger('modules:claude-code');

/**
 * Claude Code Service Implementation
 */
export class ClaudeCodeServiceImpl extends ClaudeCodeImpl {
  private activeProcesses = new Map<string, ChildProcess>();
  private config: ClaudeCodeRuntimeConfig;

  constructor(config: ClaudeCodeRuntimeConfig = {}) {
    super();
    this.config = {
      debugMode: config.debugMode ?? Boolean(process.env.DEBUG),
      maxMemoryUsage: config.maxMemoryUsage ?? 1024 * 1024 * 1024, // 1GB
      timeoutMs: config.timeoutMs ?? 30 * 60 * 1000, // 30 minutes
    };
  }

  /**
   * Execute Claude Code query
   */
  async *query(params: ClaudeCodeQueryParams): AsyncGenerator<ClaudeCodeMessage> {
    const processId = this.generateProcessId();
    let childProcess: ChildProcess | null = null;
    let readline: Interface | null = null;

    // Set entrypoint environment variable
    if (!process.env.CLAUDE_CODE_ENTRYPOINT) {
      process.env.CLAUDE_CODE_ENTRYPOINT = 'sdk-ts';
    }

    // Build process options
    const processOptions = this.buildProcessOptions(params);
    
    // Spawn child process using claude command directly
    childProcess = spawn('claude', processOptions.args, {
      cwd: processOptions.cwd,
      env: { ...process.env, ...processOptions.env },
      stdio: ['pipe', 'pipe', 'pipe'],
      signal: params.abortController?.signal,
    });

    // Register process
    this.activeProcesses.set(processId, childProcess);

    // Handle process cleanup
    const cleanup = () => {
      if (childProcess && !childProcess.killed) {
        childProcess.kill('SIGTERM');
      }
      this.activeProcesses.delete(processId);
    };

    // Setup abort handling
    params.abortController?.signal.addEventListener('abort', cleanup);
    process.on('exit', cleanup);

    // Handle stdin
    if (typeof params.prompt === 'string') {
      childProcess.stdin?.end();
    } else {
      // Handle stream input if needed
      this.streamToStdin(params.prompt, childProcess.stdin, params.abortController);
    }

    // Handle stderr in debug mode
    if (this.config.debugMode && childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        logger.debug('Claude Code stderr:', data.toString());
      });
    }

    try {
      // Handle process errors
      let processError: Error | null = null;
      childProcess.on('error', (error) => {
        processError = new Error(`Failed to spawn Claude Code process: ${error.message}`);
      });

      // Create a promise to wait for process completion
      const processExitPromise = new Promise<void>((resolve, reject) => {
        childProcess!.on('close', (code) => {
          if (params.abortController?.signal.aborted) {
            reject(new Error('Claude Code process aborted by user'));
          } else if (code !== 0) {
            reject(new Error(`Claude Code process exited with code ${code}`));
          } else {
            resolve();
          }
        });
      });

      // Create readline interface for stdout and yield messages
      if (childProcess.stdout) {
        readline = createInterface({ input: childProcess.stdout });

        try {
          for await (const line of readline) {
            if (processError) {
              throw processError;
            }

            if (line.trim()) {
              try {
                const message = JSON.parse(line);
                yield message;
              } catch (parseError) {
                logger.error('Failed to parse JSON line:', line, parseError);
                continue;
              }
            }
          }
        } finally {
          readline.close();
        }
      }

      // Wait for process to complete
      await processExitPromise;

    } finally {
      // Cleanup
      if (readline) {
        readline.close();
      }
      cleanup();
      params.abortController?.signal.removeEventListener('abort', cleanup);
    }
  }

  /**
   * Check Claude Code availability
   */
  async checkAvailability(): Promise<{
    apiKeySource?: string;
    available: boolean;
    error?: string;
    version?: string;
  }> {
    try {
      // Check environment variables
      const apiKey = process.env.ANTHROPIC_API_KEY;
      const useBedrock = process.env.CLAUDE_CODE_USE_BEDROCK === '1';
      const useVertex = process.env.CLAUDE_CODE_USE_VERTEX === '1';

      if (!apiKey && !useBedrock && !useVertex) {
        return {
          available: false,
          error: 'No API credentials found. Please set ANTHROPIC_API_KEY or configure third-party provider.',
        };
      }

      let apiKeySource = 'unknown';
      if (apiKey) apiKeySource = 'anthropic';
      else if (useBedrock) apiKeySource = 'bedrock';
      else if (useVertex) apiKeySource = 'vertex';

      // Check if claude command exists
      const claudeExists = await this.checkClaudeCommandExists();
      if (!claudeExists) {
        return {
          available: false,
          error: 'Claude CLI command not found. Please install Claude CLI first.',
        };
      }

      // Get version
      const version = await this.getVersion();

      return {
        apiKeySource,
        available: true,
        version,
      };
    } catch (error) {
      logger.error('Error checking Claude Code availability:', error);
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Get Claude Code executable path
   */
  async getExecutablePath(): Promise<string> {
    // Return claude command directly
    return 'claude';
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Kill all active processes
    for (const [processId, childProcess] of this.activeProcesses) {
      if (!childProcess.killed) {
        childProcess.kill('SIGTERM');
      }
    }
    this.activeProcesses.clear();
  }

  /**
   * Check if claude command exists
   */
  private async checkClaudeCommandExists(): Promise<boolean> {
    return new Promise((resolve) => {
      const testProcess = spawn('which', ['claude'], { stdio: 'pipe' });
      
      testProcess.on('close', (code) => {
        resolve(code === 0);
      });
      
      testProcess.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Build process options from query parameters
   */
  private buildProcessOptions(params: ClaudeCodeQueryParams): ClaudeCodeProcessOptions {
    const args = ['--output-format', 'stream-json'];
    
    if (this.config.debugMode) {
      args.push('--verbose');
    }

    const options = params.options || {};

    // Add options to args
    if (options.systemPrompt) {
      args.push('--system-prompt', options.systemPrompt);
    }
    if (options.appendSystemPrompt) {
      args.push('--append-system-prompt', options.appendSystemPrompt);
    }
    if (options.maxTurns) {
      args.push('--max-turns', options.maxTurns.toString());
    }
    if (options.permissionPromptTool) {
      args.push('--permission-prompt-tool', options.permissionPromptTool);
    }
    if (options.continueLastSession) {
      args.push('--continue');
    }
    if (options.resumeSessionId) {
      args.push('--resume', options.resumeSessionId);
    }
    if (options.allowedTools) {
      const tools = Array.isArray(options.allowedTools) 
        ? options.allowedTools.join(',')
        : options.allowedTools;
      args.push('--allowedTools', tools);
    }
    if (options.disallowedTools) {
      const tools = Array.isArray(options.disallowedTools)
        ? options.disallowedTools.join(',')
        : options.disallowedTools;
      args.push('--disallowedTools', tools);
    }
    if (options.mcpConfig) {
      args.push('--mcp-config', options.mcpConfig);
    }
    if (options.permissionMode && options.permissionMode !== 'default') {
      args.push('--permission-mode', options.permissionMode);
    }

    // Add prompt
    if (typeof params.prompt === 'string') {
      args.push('--print', params.prompt.trim());
    } else {
      args.push('--input-format', 'stream-json');
    }

    return {
      args,
      cwd: options.cwd,
      env: {},
    };
  }

  /**
   * Generate unique process ID
   */
  private generateProcessId(): string {
    return `claude-code-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Stream input to stdin
   */
  private async streamToStdin(
    stream: any,
    stdin: any,
    abortController?: AbortController
  ): Promise<void> {
    try {
      for await (const message of stream) {
        if (abortController?.signal.aborted) break;
        stdin.write(JSON.stringify(message) + '\n');
      }
      stdin.end();
    } catch (error) {
      logger.error('Error streaming to stdin:', error);
      stdin.end();
    }
  }

  /**
   * Get Claude Code version
   */
  private async getVersion(): Promise<string> {
    return new Promise((resolve) => {
      const versionProcess = spawn('claude', ['--version'], { stdio: 'pipe' });
      
      let output = '';
      versionProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      versionProcess.on('close', (code) => {
        if (code === 0) {
          // Extract version from output
          const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
          resolve(versionMatch ? versionMatch[1] : 'unknown');
        } else {
          resolve('unknown');
        }
      });
      
      versionProcess.on('error', () => {
        resolve('unknown');
      });
    });
  }
}
