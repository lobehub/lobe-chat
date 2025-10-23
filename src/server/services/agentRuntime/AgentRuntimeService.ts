import { AgentRuntime, AgentState } from '@lobechat/agent-runtime';
import debug from 'debug';
import urlJoin from 'url-join';

import { MessageModel } from '@/database/models/message';
import { LobeChatDatabase } from '@/database/type';
import {
  AgentRuntimeCoordinator,
  GeneralAgent,
  StreamEventManager,
} from '@/server/modules/AgentRuntime';
import {
  RuntimeExecutorContext,
  createRuntimeExecutors,
} from '@/server/modules/AgentRuntime/RuntimeExecutors';
import { mcpService } from '@/server/services/mcp';
import { PluginGatewayService } from '@/server/services/pluginGateway';
import { QueueService } from '@/server/services/queue';
import { ToolExecutionService } from '@/server/services/toolExecution';
import { BuiltinToolsExecutor } from '@/server/services/toolExecution/builtin';

import type {
  AgentExecutionParams,
  AgentExecutionResult,
  PendingInterventionsResult,
  SessionCreationParams,
  SessionCreationResult,
  SessionStatusResult,
  StartExecutionParams,
  StartExecutionResult,
} from './types';

const log = debug('lobe-server:agent-runtime-service');

/**
 * Agent Runtime Service
 * 封装 Agent 执行相关的逻辑，提供统一的服务接口
 */
export class AgentRuntimeService {
  private coordinator: AgentRuntimeCoordinator;
  private streamManager: StreamEventManager;
  private queueService: QueueService;
  private toolExecutionService: ToolExecutionService;
  private get baseURL() {
    const baseUrl =
      process.env.AGENT_RUNTIME_BASE_URL || process.env.APP_URL || 'http://localhost:3010';

    return urlJoin(baseUrl, '/api/agent');
  }
  private userId: string;
  private db: LobeChatDatabase;
  private messageModel: MessageModel;

  constructor(db: LobeChatDatabase, userId: string) {
    this.coordinator = new AgentRuntimeCoordinator();
    this.streamManager = new StreamEventManager();
    this.queueService = new QueueService();
    this.userId = userId;
    this.db = db;
    this.messageModel = new MessageModel(db, this.userId);

    // Initialize ToolExecutionService with dependencies
    const pluginGatewayService = new PluginGatewayService();
    const builtinToolsExecutor = new BuiltinToolsExecutor();

    this.toolExecutionService = new ToolExecutionService({
      builtinToolsExecutor,
      mcpService,
      pluginGatewayService,
    });
  }

  /**
   * 创建新的 Agent 会话
   */
  async createSession(params: SessionCreationParams): Promise<SessionCreationResult> {
    const {
      sessionId,
      initialContext,
      agentConfig,
      modelRuntimeConfig,
      userId,
      autoStart = true,
      tools,
      initialMessages = [],
      appContext,
      toolManifestMap,
    } = params;

    try {
      log('[ %s] Creating new session (autoStart: %s)', sessionId, autoStart);

      // 初始化会话状态 - 先创建状态再保存
      const initialState = {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        // 使用传入的初始消息
        messages: initialMessages,
        metadata: {
          agentConfig,
          modelRuntimeConfig,
          userId,
          ...appContext,
        },
        sessionId,
        status: 'idle',
        stepCount: 0,
        toolManifestMap,
        tools,
      } as Partial<AgentState>;

      // 使用协调器创建会话，自动发送初始化事件
      await this.coordinator.createAgentSession(sessionId, {
        agentConfig,
        modelRuntimeConfig,
        userId,
      });

      // 保存初始状态
      await this.coordinator.saveAgentState(sessionId, initialState as any);

      let messageId: string | undefined;
      let autoStarted = false;

      // 只有在 autoStart 为 true 时才调度第一步执行
      if (autoStart) {
        messageId = await this.queueService.scheduleMessage({
          context: initialContext,
          delay: 50, // 短延迟启动
          endpoint: `${this.baseURL}/run`,
          priority: 'high',
          sessionId,
          stepIndex: 0,
        });
        autoStarted = true;
        log('[%s]Scheduled first step (messageId: %s)', sessionId, messageId);
      } else {
        log('[%s]created session without auto-start', sessionId);
      }

      return { autoStarted, messageId, sessionId, success: true };
    } catch (error) {
      log('Failed to create session %s: %O', sessionId, error);
      throw error;
    }
  }

  /**
   * 执行 Agent 步骤
   */
  async executeStep(params: AgentExecutionParams): Promise<AgentExecutionResult> {
    const { sessionId, stepIndex, context, humanInput, approvedToolCall, rejectionReason } = params;

    try {
      log(`[${sessionId}] Executing step %d`, stepIndex);

      // 发布步骤开始事件
      await this.streamManager.publishStreamEvent(sessionId, {
        data: {},
        stepIndex,
        type: 'step_start',
      });

      // 获取会话状态和元数据
      const [agentState, sessionMetadata] = await Promise.all([
        this.coordinator.loadAgentState(sessionId),
        this.coordinator.getSessionMetadata(sessionId),
      ]);

      if (!agentState) {
        throw new Error(`Agent state not found for session ${sessionId}`);
      }

      // 创建 Agent 和 Runtime 实例
      const { runtime } = await this.createAgentRuntime({
        metadata: sessionMetadata,
        sessionId,
        stepIndex,
      });

      // 处理人工干预
      let currentContext = context;
      let currentState = agentState;

      if (humanInput || approvedToolCall || rejectionReason) {
        const interventionResult = await this.handleHumanIntervention(runtime, currentState, {
          approvedToolCall,
          humanInput,
          rejectionReason,
        });
        currentState = interventionResult.newState;
        currentContext = interventionResult.nextContext;
      }

      // 执行步骤
      const startAt = Date.now();
      const stepResult = await runtime.step(currentState, currentContext);

      // 保存状态，协调器会自动处理事件发送
      await this.coordinator.saveStepResult(sessionId, {
        ...stepResult,
        executionTime: Date.now() - startAt,
        stepIndex, // placeholder
      });

      // 决定是否调度下一步
      const shouldContinue = this.shouldContinueExecution(
        stepResult.newState,
        stepResult.nextContext,
      );
      let nextStepScheduled = false;

      // 发布步骤完成事件
      await this.streamManager.publishStreamEvent(sessionId, {
        data: {
          finalState: stepResult.newState,
          nextStepScheduled,
          stepIndex,
        },
        stepIndex,
        type: 'step_complete',
      });

      log(`[${sessionId}] Step %d completed`, stepIndex);

      if (shouldContinue && stepResult.nextContext) {
        const nextStepIndex = stepIndex + 1;
        const delay = this.calculateStepDelay(stepResult);
        const priority = this.calculatePriority(stepResult);

        await this.queueService.scheduleMessage({
          context: stepResult.nextContext,
          delay,
          endpoint: `${this.baseURL}/run`,
          priority,
          sessionId,
          stepIndex: nextStepIndex,
        });
        nextStepScheduled = true;

        log(`[${sessionId}] Scheduled next step %d for session %s`, nextStepIndex);
      }

      return {
        nextStepScheduled,
        state: stepResult.newState,
        stepResult,
        success: true,
      };
    } catch (error) {
      log('Step %d failed for session %s: %O', stepIndex, sessionId, error);

      // 发布错误事件
      await this.streamManager.publishStreamEvent(sessionId, {
        data: {
          error: (error as Error).message,
          phase: 'step_execution',
          stepIndex,
        },
        stepIndex,
        type: 'error',
      });

      throw error;
    }
  }

  /**
   * 获取会话状态
   */
  async getSessionStatus(params: {
    historyLimit?: number;
    includeHistory?: boolean;
    sessionId: string;
  }): Promise<SessionStatusResult> {
    const { sessionId, includeHistory = false, historyLimit = 10 } = params;

    try {
      log('Getting session status for %s', sessionId);

      // 获取当前状态和元数据
      const [currentState, sessionMetadata] = await Promise.all([
        this.coordinator.loadAgentState(sessionId),
        this.coordinator.getSessionMetadata(sessionId),
      ]);

      if (!currentState || !sessionMetadata) {
        throw new Error('Session not found');
      }

      // 获取执行历史（如果需要）
      let executionHistory;
      if (includeHistory) {
        try {
          executionHistory = await this.coordinator.getExecutionHistory(sessionId, historyLimit);
        } catch (error) {
          log('Failed to load execution history: %O', error);
          executionHistory = [];
        }
      }

      // 获取最近的流式事件（用于调试）
      let recentEvents;
      if (includeHistory) {
        try {
          recentEvents = await this.streamManager.getStreamHistory(sessionId, 20);
        } catch (error) {
          log('Failed to load recent events: %O', error);
          recentEvents = [];
        }
      }

      // 计算会话统计信息
      const stats = {
        lastActiveTime: sessionMetadata.lastActiveAt
          ? Date.now() - new Date(sessionMetadata.lastActiveAt).getTime()
          : 0,
        totalCost: currentState.cost?.total || 0,
        totalMessages: currentState.messages?.length || 0,
        totalSteps: currentState.stepCount || 0,
        uptime: sessionMetadata.createdAt
          ? Date.now() - new Date(sessionMetadata.createdAt).getTime()
          : 0,
      };

      return {
        currentState: {
          cost: currentState.cost,
          costLimit: currentState.costLimit,
          error: currentState.error,
          interruption: currentState.interruption,
          lastModified: currentState.lastModified,
          maxSteps: currentState.maxSteps,
          pendingHumanPrompt: currentState.pendingHumanPrompt,
          pendingHumanSelect: currentState.pendingHumanSelect,
          pendingToolsCalling: currentState.pendingToolsCalling,
          status: currentState.status,
          stepCount: currentState.stepCount,
          usage: currentState.usage,
        },
        executionHistory: executionHistory?.slice(0, historyLimit),
        hasError: currentState.status === 'error',
        isActive: ['running', 'waiting_for_human'].includes(currentState.status),
        isCompleted: currentState.status === 'done',
        metadata: sessionMetadata,
        needsHumanInput: currentState.status === 'waiting_for_human',
        recentEvents: recentEvents?.slice(0, 10),
        sessionId,
        stats,
      };
    } catch (error) {
      log('Failed to get session status for %s: %O', sessionId, error);
      throw error;
    }
  }

  /**
   * 获取待处理的人工干预列表
   */
  async getPendingInterventions(params: {
    sessionId?: string;
    userId?: string;
  }): Promise<PendingInterventionsResult> {
    const { sessionId, userId } = params;

    try {
      log('Getting pending interventions for sessionId: %s, userId: %s', sessionId, userId);

      let sessions: string[] = [];

      if (sessionId) {
        sessions = [sessionId];
      } else if (userId) {
        // 获取用户的所有活跃会话
        try {
          const activeSessions = await this.coordinator.getActiveSessions();

          // 过滤出属于该用户的会话
          const userSessions = [];
          for (const session of activeSessions) {
            try {
              const metadata = await this.coordinator.getSessionMetadata(session);
              if (metadata?.userId === userId) {
                userSessions.push(session);
              }
            } catch (error) {
              log('Failed to get metadata for session %s: %O', session, error);
            }
          }
          sessions = userSessions;
        } catch (error) {
          log('Failed to get active sessions: %O', error);
          sessions = [];
        }
      }

      // 检查每个会话的状态
      const pendingInterventions = [];

      for (const session of sessions) {
        try {
          const [state, metadata] = await Promise.all([
            this.coordinator.loadAgentState(session),
            this.coordinator.getSessionMetadata(session),
          ]);

          if (state?.status === 'waiting_for_human') {
            const intervention: any = {
              lastModified: state.lastModified,
              modelRuntimeConfig: metadata?.modelRuntimeConfig,
              sessionId: session,
              status: state.status,
              stepCount: state.stepCount,
              userId: metadata?.userId,
            };

            // 添加具体的待处理内容
            if (state.pendingToolsCalling) {
              intervention.type = 'tool_approval';
              intervention.pendingToolsCalling = state.pendingToolsCalling;
            } else if (state.pendingHumanPrompt) {
              intervention.type = 'human_prompt';
              intervention.pendingHumanPrompt = state.pendingHumanPrompt;
            } else if (state.pendingHumanSelect) {
              intervention.type = 'human_select';
              intervention.pendingHumanSelect = state.pendingHumanSelect;
            }

            pendingInterventions.push(intervention);
          }
        } catch (error) {
          log('Failed to get state for session %s: %O', session, error);
        }
      }

      return {
        pendingInterventions,
        timestamp: new Date().toISOString(),
        totalCount: pendingInterventions.length,
      };
    } catch (error) {
      log('Failed to get pending interventions: %O', error);
      throw error;
    }
  }

  /**
   * 显式启动会话执行
   */
  async startExecution(params: StartExecutionParams): Promise<StartExecutionResult> {
    const { sessionId, context, priority = 'normal', delay = 50 } = params;

    try {
      log('Starting execution for session %s', sessionId);

      // 检查会话是否存在
      const sessionMetadata = await this.coordinator.getSessionMetadata(sessionId);
      if (!sessionMetadata) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // 获取当前状态
      const currentState = await this.coordinator.loadAgentState(sessionId);
      if (!currentState) {
        throw new Error(`Agent state not found for session ${sessionId}`);
      }

      // 检查会话状态
      if (currentState.status === 'running') {
        throw new Error(`Session ${sessionId} is already running`);
      }

      if (currentState.status === 'done') {
        throw new Error(`Session ${sessionId} is already completed`);
      }

      if (currentState.status === 'error') {
        throw new Error(`Session ${sessionId} is in error state`);
      }

      // 构建执行上下文
      let executionContext = context;
      if (!executionContext) {
        // 如果没有提供上下文，从元数据构建默认上下文
        executionContext = {
          payload: {
            isFirstMessage: true,
            message: [{ content: '' }],
          },
          phase: 'user_input' as const,
          session: {
            messageCount: currentState.messages?.length || 0,
            sessionId,
            status: 'idle' as const,
            stepCount: currentState.stepCount || 0,
          },
        };
      }

      // 更新会话状态为运行中
      await this.coordinator.saveAgentState(sessionId, {
        ...currentState,
        lastModified: new Date().toISOString(),
        status: 'running',
      });

      // 调度执行
      const messageId = await this.queueService.scheduleMessage({
        context: executionContext,
        delay,
        endpoint: `${this.baseURL}/run`,
        priority,
        sessionId,
        stepIndex: currentState.stepCount || 0,
      });

      log('Scheduled execution for session %s (messageId: %s)', sessionId, messageId);

      return {
        messageId,
        scheduled: true,
        sessionId,
        success: true,
      };
    } catch (error) {
      log('Failed to start execution for session %s: %O', sessionId, error);
      throw error;
    }
  }

  /**
   * 处理人工干预
   */
  async processHumanIntervention(params: {
    action: 'approve' | 'reject' | 'input' | 'select';
    approvedToolCall?: any;
    humanInput?: any;
    rejectionReason?: string;
    sessionId: string;
    stepIndex: number;
  }): Promise<{ messageId: string }> {
    const { sessionId, stepIndex, action, approvedToolCall, humanInput, rejectionReason } = params;

    try {
      log(
        'Processing human intervention for session %s:%d (action: %s)',
        sessionId,
        stepIndex,
        action,
      );

      // 高优先级调度执行
      const messageId = await this.queueService.scheduleMessage({
        context: undefined, // 会从状态管理器中获取
        delay: 100,
        endpoint: `${this.baseURL}/run`,
        payload: { approvedToolCall, humanInput, rejectionReason },
        priority: 'high',
        sessionId,
        stepIndex,
      });

      log('Scheduled immediate execution for session %s (messageId: %s)', sessionId, messageId);

      return { messageId };
    } catch (error) {
      log('Failed to process human intervention for session %s: %O', sessionId, error);
      throw error;
    }
  }

  /**
   * 创建 Agent Runtime 实例
   */
  private async createAgentRuntime({
    metadata,
    sessionId,
    stepIndex,
  }: {
    metadata?: any;
    sessionId: string;
    stepIndex: number;
  }) {
    // 创建 Durable Agent 实例
    const agent = new GeneralAgent({
      agentConfig: metadata?.agentConfig,
      modelRuntimeConfig: metadata?.modelRuntimeConfig,
      sessionId,
      userId: metadata?.userId,
    });

    // 创建流式执行器上下文
    const executorContext: RuntimeExecutorContext = {
      messageModel: this.messageModel,
      sessionId,
      stepIndex,
      streamManager: this.streamManager,
      toolExecutionService: this.toolExecutionService,
      userId: metadata?.userId,
    };

    // 创建 Agent Runtime 实例
    const runtime = new AgentRuntime(agent as any, {
      executors: createRuntimeExecutors(executorContext),
    });

    return { agent, runtime };
  }

  /**
   * 处理人工干预逻辑
   */
  private async handleHumanIntervention(
    runtime: AgentRuntime,
    state: any,
    intervention: { approvedToolCall?: any; humanInput?: any; rejectionReason?: string },
  ) {
    const { humanInput, approvedToolCall, rejectionReason } = intervention;

    if (approvedToolCall && state.status === 'waiting_for_human') {
      // TODO: 实现 approveToolCall 逻辑
      return { newState: state, nextContext: undefined };
    } else if (rejectionReason && state.status === 'waiting_for_human') {
      // TODO: 实现 rejectToolCall 逻辑
      return { newState: state, nextContext: undefined };
    } else if (humanInput) {
      // TODO: 实现 processHumanInput 逻辑
      return { newState: state, nextContext: undefined };
    }

    return { newState: state, nextContext: undefined };
  }

  /**
   * 决定是否继续执行
   */
  private shouldContinueExecution(state: any, context?: any): boolean {
    // 已完成
    if (state.status === 'done') return false;

    // 需要人工干预
    if (state.status === 'waiting_for_human') return false;

    // 出错了
    if (state.status === 'error') return false;

    // 被中断
    if (state.status === 'interrupted') return false;

    // 达到最大步数
    if (state.maxSteps && state.stepCount >= state.maxSteps) return false;

    // 超过成本限制
    if (state.costLimit && state.cost?.total >= state.costLimit.maxTotalCost) {
      return state.costLimit.onExceeded !== 'stop';
    }

    // 没有下一个上下文
    if (!context) return false;

    return true;
  }

  /**
   * 计算步骤延迟
   */
  private calculateStepDelay(stepResult: any): number {
    const baseDelay = 50;

    // 如果有工具调用，延迟长一点
    if (stepResult.events?.some((e: any) => e.type === 'tool_result')) {
      return baseDelay + 50;
    }

    // 如果有错误，使用指数退避
    if (stepResult.events?.some((e: any) => e.type === 'error')) {
      return Math.min(baseDelay * 2, 1000);
    }

    return baseDelay;
  }

  /**
   * 计算优先级
   */
  private calculatePriority(stepResult: any): 'high' | 'normal' | 'low' {
    // 如果需要人工干预，高优先级
    if (stepResult.newState?.status === 'waiting_for_human') {
      return 'high';
    }

    // 如果有错误，正常优先级
    if (stepResult.events?.some((e: any) => e.type === 'error')) {
      return 'normal';
    }

    return 'normal';
  }
}
