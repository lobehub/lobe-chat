import { AgentState } from '@lobechat/agent-runtime';
import debug from 'debug';

import { AgentSessionMetadata, AgentStateManager, StepResult } from './AgentStateManager';
import { StreamEventManager } from './StreamEventManager';

const log = debug('lobe-server:agent-runtime:coordinator');

/**
 * Agent Runtime Coordinator
 * 协调 AgentStateManager 和 StreamEventManager 的操作
 * 负责在状态变更时发送相应的事件
 */
export class AgentRuntimeCoordinator {
  private stateManager: AgentStateManager;
  private streamEventManager: StreamEventManager;

  constructor() {
    this.stateManager = new AgentStateManager();
    this.streamEventManager = new StreamEventManager();
  }

  /**
   * 创建新的 Agent 会话并发送初始化事件
   */
  async createAgentSession(
    sessionId: string,
    data: {
      agentConfig?: any;
      modelRuntimeConfig?: any;
      userId?: string;
    },
  ): Promise<void> {
    try {
      // 创建会话元数据
      await this.stateManager.createSessionMetadata(sessionId, data);

      // 获取创建的元数据
      const metadata = await this.stateManager.getSessionMetadata(sessionId);

      if (metadata) {
        // 发送 agent runtime init 事件
        await this.streamEventManager.publishAgentRuntimeInit(sessionId, metadata);
        log('[%s] Agent session created and initialized', sessionId);
      }
    } catch (error) {
      console.error('Failed to create agent session:', error);
      throw error;
    }
  }

  /**
   * 保存 Agent 状态并处理相应事件
   */
  async saveAgentState(sessionId: string, state: AgentState): Promise<void> {
    try {
      const previousState = await this.stateManager.loadAgentState(sessionId);

      // 保存状态
      await this.stateManager.saveAgentState(sessionId, state);

      // 如果状态变为 done，发送 agent runtime end 事件
      if (state.status === 'done' && previousState?.status !== 'done') {
        await this.streamEventManager.publishAgentRuntimeEnd(sessionId, state.stepCount, state);
        log('[%s] Agent runtime completed', sessionId);
      }
    } catch (error) {
      console.error('Failed to save agent state and handle events:', error);
      throw error;
    }
  }

  /**
   * 保存步骤结果并处理相应事件
   */
  async saveStepResult(sessionId: string, stepResult: StepResult): Promise<void> {
    try {
      // 保存步骤结果
      await this.stateManager.saveStepResult(sessionId, stepResult);

      // 不在这里发送 agent_runtime_end 事件，让 saveAgentState 统一处理
      // 这样确保 agent_runtime_end 是最后一个事件
    } catch (error) {
      console.error('Failed to save step result and handle events:', error);
      throw error;
    }
  }

  /**
   * 获取 Agent 状态
   */
  async loadAgentState(sessionId: string): Promise<AgentState | null> {
    return this.stateManager.loadAgentState(sessionId);
  }

  /**
   * 获取会话元数据
   */
  async getSessionMetadata(sessionId: string): Promise<AgentSessionMetadata | null> {
    return this.stateManager.getSessionMetadata(sessionId);
  }

  /**
   * 获取执行历史
   */
  async getExecutionHistory(sessionId: string, limit?: number): Promise<any[]> {
    return this.stateManager.getExecutionHistory(sessionId, limit);
  }

  /**
   * 删除 Agent 会话
   */
  async deleteAgentSession(sessionId: string): Promise<void> {
    try {
      await Promise.all([
        this.stateManager.deleteAgentSession(sessionId),
        this.streamEventManager.cleanupSession(sessionId),
      ]);
      log('Agent session deleted: %s', sessionId);
    } catch (error) {
      console.error('Failed to delete agent session:', error);
      throw error;
    }
  }

  /**
   * 获取活跃会话
   */
  async getActiveSessions(): Promise<string[]> {
    return this.stateManager.getActiveSessions();
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<{
    activeSessions: number;
    completedSessions: number;
    errorSessions: number;
    totalSessions: number;
  }> {
    return this.stateManager.getStats();
  }

  /**
   * 清理过期会话
   */
  async cleanupExpiredSessions(): Promise<number> {
    return this.stateManager.cleanupExpiredSessions();
  }

  /**
   * 关闭连接
   */
  async disconnect(): Promise<void> {
    await Promise.all([this.stateManager.disconnect(), this.streamEventManager.disconnect()]);
  }
}
