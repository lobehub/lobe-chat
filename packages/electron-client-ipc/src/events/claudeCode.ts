import {
  ClaudeCodeMessage,
  ClaudeCodeQueryParams,
  ClaudeCodeQueryResult,
  ClaudeCodeSessionInfo,
  ClaudeCodeStreamingParams,
} from '../types/claudeCode';

export interface ClaudeCodeDispatchEvents {
  /**
   * 触发 abort controller
   */
  claudeCodeAbort: (signalId: string) => { success: boolean };

  /**
   * 检查 Claude Code 是否可用
   */
  claudeCodeCheckAvailability: () => {
    apiKeySource?: string;
    available: boolean;
    error?: string;
    version?: string;
  };

  /**
   * 清除指定会话
   */
  claudeCodeClearSession: (sessionId: string) => { success: boolean };

  /**
   * 创建 abort controller 并返回其 ID
   */
  claudeCodeCreateAbortController: () => { signalId: string };

  /**
   * 获取最近的会话列表
   */
  claudeCodeGetRecentSessions: () => ClaudeCodeSessionInfo[];

  /**
   * 执行 Claude Code 查询
   */
  claudeCodeQuery: (params: ClaudeCodeQueryParams) => ClaudeCodeQueryResult;

  /**
   * 开始流式 Claude Code 查询
   */
  claudeCodeStreamStart: (params: ClaudeCodeStreamingParams) => {
    error?: string;
    success: boolean;
  };

  /**
   * 停止流式 Claude Code 查询
   */
  claudeCodeStreamStop: (streamId: string) => { success: boolean };
}

export interface ClaudeCodeBroadcastEvents {
  /**
   * 流式完成事件
   */
  claudeCodeStreamComplete: (data: { sessionId: string, streamId: string; }) => void;

  /**
   * 流式错误事件
   */
  claudeCodeStreamError: (data: { error: string, streamId: string; }) => void;

  /**
   * 流式消息事件
   */
  claudeCodeStreamMessage: (data: { message: ClaudeCodeMessage, streamId: string; }) => void;
}
