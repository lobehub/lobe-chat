import { type SDKMessage, query } from '@anthropic-ai/claude-code';
import {
  ClaudeCodeMessage,
  ClaudeCodeOptions,
  ClaudeCodeQueryParams,
  ClaudeCodeQueryResult,
  ClaudeCodeSessionInfo,
  ClaudeCodeStreamingParams,
} from '@lobechat/electron-client-ipc';
import { app } from 'electron';
import { join } from 'node:path';

import { createLogger } from '@/utils/logger';

import { ControllerModule, ipcClientEvent } from './index';

const logger = createLogger('controllers:ClaudeCodeCtr');

interface StreamingSession {
  abortController: AbortController;
  sessionId?: string;
  streamId: string;
}

export default class ClaudeCodeCtr extends ControllerModule {
  private streamingSessions = new Map<string, StreamingSession>();
  private abortControllers = new Map<string, AbortController>();
  private sessionHistory = new Map<string, ClaudeCodeSessionInfo>();

  /**
   * 检查 Claude Code 是否可用
   */
  @ipcClientEvent('claudeCodeCheckAvailability')
  async checkAvailability(): Promise<{
    apiKeySource?: string;
    available: boolean;
    error?: string;
    version?: string;
  }> {
    try {
      // 检查环境变量
      const apiKey = process.env.ANTHROPIC_API_KEY;
      const useBedrock = process.env.CLAUDE_CODE_USE_BEDROCK === '1';
      const useVertex = process.env.CLAUDE_CODE_USE_VERTEX === '1';

      if (!apiKey && !useBedrock && !useVertex) {
        return {
          available: false,
          error:
            'No API credentials found. Please set ANTHROPIC_API_KEY or configure third-party provider.',
        };
      }

      let apiKeySource = 'unknown';
      if (apiKey) apiKeySource = 'anthropic';
      else if (useBedrock) apiKeySource = 'bedrock';
      else if (useVertex) apiKeySource = 'vertex';

      // 获取包版本
      const packagePath = require.resolve('@anthropic-ai/claude-code/package.json');
      const packageJson = require(packagePath);
      const version = packageJson.version;

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
   * 执行 Claude Code 查询
   */
  @ipcClientEvent('claudeCodeQuery')
  async executeQuery(params: ClaudeCodeQueryParams): Promise<ClaudeCodeQueryResult> {
    try {
      logger.info('Executing Claude Code query:', params.prompt);

      const abortController = params.abortSignal
        ? this.abortControllers.get(params.abortSignal)
        : new AbortController();

      const messages: ClaudeCodeMessage[] = [];
      let sessionId: string | undefined;

      const options = this.buildOptions(params.options);

      for await (const message of query({
        abortController,
        options,
        prompt: params.prompt,
      })) {
        const claudeMessage = this.convertSDKMessage(message);
        messages.push(claudeMessage);

        if (message.session_id) {
          sessionId = message.session_id;
        }
      }

      // 更新会话历史
      if (sessionId) {
        this.updateSessionHistory(sessionId, messages);
      }

      return {
        messages,
        sessionId: sessionId || '',
        success: true,
      };
    } catch (error) {
      logger.error('Error executing Claude Code query:', error);
      return {
        error: error.message,
        messages: [],
        sessionId: '',
        success: false,
      };
    }
  }

  /**
   * 开始流式查询
   */
  @ipcClientEvent('claudeCodeStreamStart')
  async startStreamingQuery(
    params: ClaudeCodeStreamingParams,
  ): Promise<{ error?: string; success: boolean }> {
    try {
      logger.info('Starting streaming Claude Code query:', params.streamId);

      const abortController = params.abortSignal
        ? this.abortControllers.get(params.abortSignal)
        : new AbortController();

      const session: StreamingSession = {
        abortController,
        streamId: params.streamId,
      };

      this.streamingSessions.set(params.streamId, session);

      const options = this.buildOptions(params.options);

      // 在后台执行流式查询
      this.executeStreamingQuery(params, abortController, options);

      return { success: true };
    } catch (error) {
      logger.error('Error starting streaming query:', error);
      return { error: error.message, success: false };
    }
  }

  /**
   * 停止流式查询
   */
  @ipcClientEvent('claudeCodeStreamStop')
  async stopStreamingQuery(streamId: string): Promise<{ success: boolean }> {
    try {
      logger.info('Stopping streaming query:', streamId);

      const session = this.streamingSessions.get(streamId);
      if (session) {
        session.abortController.abort();
        this.streamingSessions.delete(streamId);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error stopping streaming query:', error);
      return { success: false };
    }
  }

  /**
   * 创建 AbortController
   */
  @ipcClientEvent('claudeCodeCreateAbortController')
  createAbortController(): { signalId: string } {
    const signalId = `abort-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const abortController = new AbortController();
    this.abortControllers.set(signalId, abortController);

    logger.debug('Created AbortController:', signalId);

    // 清理过期的 AbortController（30分钟后）
    setTimeout(
      () => {
        this.abortControllers.delete(signalId);
      },
      30 * 60 * 1000,
    );

    return { signalId };
  }

  /**
   * 触发 abort
   */
  @ipcClientEvent('claudeCodeAbort')
  abort(signalId: string): { success: boolean } {
    try {
      const abortController = this.abortControllers.get(signalId);
      if (abortController) {
        abortController.abort();
        this.abortControllers.delete(signalId);
        logger.debug('Aborted signal:', signalId);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      logger.error('Error aborting:', error);
      return { success: false };
    }
  }

  /**
   * 获取最近的会话列表
   */
  @ipcClientEvent('claudeCodeGetRecentSessions')
  getRecentSessions(): ClaudeCodeSessionInfo[] {
    const sessions = Array.from(this.sessionHistory.values());
    // 按最后活跃时间排序
    sessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
    // 返回最近 20 个会话
    return sessions.slice(0, 20);
  }

  /**
   * 清除指定会话
   */
  @ipcClientEvent('claudeCodeClearSession')
  clearSession(sessionId: string): { success: boolean } {
    try {
      this.sessionHistory.delete(sessionId);
      logger.debug('Cleared session:', sessionId);
      return { success: true };
    } catch (error) {
      logger.error('Error clearing session:', error);
      return { success: false };
    }
  }

  /**
   * 执行流式查询（后台）
   */
  private async executeStreamingQuery(
    params: ClaudeCodeStreamingParams,
    abortController: AbortController,
    options: any,
  ) {
    try {
      const { streamId } = params;
      let sessionId: string | undefined;

      for await (const message of query({
        abortController,
        options,
        prompt: params.prompt,
      })) {
        const claudeMessage = this.convertSDKMessage(message);

        // 广播消息到渲染进程
        this.app.browserManager.broadcastToWindow('chat', 'claudeCodeStreamMessage', {
          message: claudeMessage,
          streamId,
        });

        if (message.session_id) {
          sessionId = message.session_id;
          const session = this.streamingSessions.get(streamId);
          if (session) {
            session.sessionId = sessionId;
          }
        }
      }

      // 更新会话历史
      if (sessionId) {
        // 这里我们不存储所有消息，只更新会话信息
        const existingSession = this.sessionHistory.get(sessionId);
        if (existingSession) {
          existingSession.lastActiveAt = Date.now();
          existingSession.turnCount++;
        } else {
          this.sessionHistory.set(sessionId, {
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
            sessionId,
            turnCount: 1,
          });
        }
      }

      // 广播完成事件
      this.app.browserManager.broadcastToWindow('chat', 'claudeCodeStreamComplete', {
        sessionId: sessionId || '',
        streamId,
      });

      // 清理
      this.streamingSessions.delete(streamId);
    } catch (error) {
      logger.error('Error in streaming query:', error);

      // 广播错误事件
      this.app.browserManager.broadcastToWindow('chat', 'claudeCodeStreamError', {
        error: error.message,
        streamId: params.streamId,
      });

      // 清理
      this.streamingSessions.delete(params.streamId);
    }
  }

  /**
   * 构建选项对象
   */
  private buildOptions(options?: ClaudeCodeOptions): any {
    const defaultOptions = {
      // cwd: app.getPath('userData'),
      maxTurns: 5,
      outputFormat: 'stream-json',
    };

    if (!options) {
      return defaultOptions;
    }

    // 处理 allowedTools 和 disallowedTools
    const processedOptions: any = { ...defaultOptions, ...options };

    // 如果 allowedTools 是数组，转换为空格分隔的字符串

    // 如果提供了 mcpConfig 路径，确保它是绝对路径
    if (options.mcpConfig && !join(options.mcpConfig).startsWith('/')) {
      processedOptions.mcpConfig = join(app.getPath('userData'), options.mcpConfig);
    }

    return processedOptions;
  }

  /**
   * 转换 SDK 消息为 ClaudeCode 消息
   */
  private convertSDKMessage(sdkMessage: SDKMessage): ClaudeCodeMessage {
    // SDKMessage 已经是正确的格式，直接返回
    return sdkMessage as ClaudeCodeMessage;
  }

  /**
   * 更新会话历史
   */
  private updateSessionHistory(sessionId: string, messages: ClaudeCodeMessage[]) {
    const resultMessage = messages.find((m) => m.type === 'result');

    const existingSession = this.sessionHistory.get(sessionId);
    if (existingSession) {
      existingSession.lastActiveAt = Date.now();
      existingSession.turnCount++;
      if (resultMessage?.total_cost_usd) {
        existingSession.totalCost = (existingSession.totalCost || 0) + resultMessage.total_cost_usd;
      }
    } else {
      this.sessionHistory.set(sessionId, {
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        sessionId,
        totalCost: resultMessage?.total_cost_usd,
        turnCount: 1,
      });
    }
  }
}
