import debug from 'debug';

const log = debug('lobe-server:agent-runtime:chat-agent');

export interface ChatAgentConfig {
  agentConfig?: {
    [key: string]: any;
    maxSteps?: number;
  };
  modelRuntimeConfig?: {
    model: string;
    provider: string;
  };
  sessionId: string;
  userId?: string;
}

/**
 * 最简单的 对话 Agent 实现
 */
export class ChatAgent {
  private config: ChatAgentConfig;

  constructor(config: ChatAgentConfig) {
    this.config = config;
  }

  /**
   * 最简单的决策逻辑
   */
  async runner(context: any, state: any) {
    log('Processing phase: %s for session %s', context.phase, this.config.sessionId);

    switch (context.phase) {
      case 'user_input': {
        // 直接调用 LLM
        return {
          payload: {
            messages: state.messages,
            model: this.config.modelRuntimeConfig?.model,
            provider: this.config.modelRuntimeConfig?.provider,
          },
          type: 'call_llm',
        };
      }

      case 'llm_result': {
        // LLM 完成，结束流程
        return {
          reason: 'completed',
          reasonDetail: 'Simple agent completed successfully',
          type: 'finish',
        };
      }

      default: {
        return {
          reason: 'error_recovery',
          reasonDetail: `Unknown phase: ${context.phase}`,
          type: 'finish',
        };
      }
    }
  }

  /**
   * 空工具注册表
   */
  tools = {};

  /**
   * 获取配置
   */
  getConfig() {
    return this.config;
  }
}
