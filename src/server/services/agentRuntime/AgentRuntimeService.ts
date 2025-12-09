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
  OperationCreationParams,
  OperationCreationResult,
  OperationStatusResult,
  PendingInterventionsResult,
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

    return urlJoin(baseUrl, '/api/workflows/agent');
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
   * 创建新的 Agent 操作
   */
  async createOperation(params: OperationCreationParams): Promise<OperationCreationResult> {
    const {
      operationId,
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
      log('[%s] Creating new operation (autoStart: %s)', operationId, autoStart);

      // 初始化操作状态 - 先创建状态再保存
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
        operationId,
        status: 'idle',
        stepCount: 0,
        toolManifestMap,
        tools,
      } as Partial<AgentState>;

      // 使用协调器创建操作，自动发送初始化事件
      await this.coordinator.createAgentOperation(operationId, {
        agentConfig,
        modelRuntimeConfig,
        userId,
      });

      // 保存初始状态
      await this.coordinator.saveAgentState(operationId, initialState as any);

      let messageId: string | undefined;
      let autoStarted = false;

      // 只有在 autoStart 为 true 时才调度第一步执行
      if (autoStart) {
        messageId = await this.queueService.scheduleMessage({
          context: initialContext,
          delay: 50, // 短延迟启动
          endpoint: `${this.baseURL}/run`,
          operationId,
          priority: 'high',
          stepIndex: 0,
        });
        autoStarted = true;
        log('[%s] Scheduled first step (messageId: %s)', operationId, messageId);
      } else {
        log('[%s] Created operation without auto-start', operationId);
      }

      return { autoStarted, messageId, operationId, success: true };
    } catch (error) {
      log('Failed to create operation %s: %O', operationId, error);
      throw error;
    }
  }

  /**
   * 执行 Agent 步骤
   */
  async executeStep(params: AgentExecutionParams): Promise<AgentExecutionResult> {
    const { operationId, stepIndex, context, humanInput, approvedToolCall, rejectionReason } =
      params;

    try {
      log('[%s] Executing step %d', operationId, stepIndex);

      // 发布步骤开始事件
      await this.streamManager.publishStreamEvent(operationId, {
        data: {},
        stepIndex,
        type: 'step_start',
      });

      // 获取操作状态和元数据
      const [agentState, operationMetadata] = await Promise.all([
        this.coordinator.loadAgentState(operationId),
        this.coordinator.getOperationMetadata(operationId),
      ]);

      if (!agentState) {
        throw new Error(`Agent state not found for operation ${operationId}`);
      }

      // 创建 Agent 和 Runtime 实例
      const { runtime } = await this.createAgentRuntime({
        metadata: operationMetadata,
        operationId,
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
      await this.coordinator.saveStepResult(operationId, {
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
      await this.streamManager.publishStreamEvent(operationId, {
        data: {
          finalState: stepResult.newState,
          nextStepScheduled,
          stepIndex,
        },
        stepIndex,
        type: 'step_complete',
      });

      log('[%s] Step %d completed', operationId, stepIndex);

      if (shouldContinue && stepResult.nextContext) {
        const nextStepIndex = stepIndex + 1;
        const delay = this.calculateStepDelay(stepResult);
        const priority = this.calculatePriority(stepResult);

        await this.queueService.scheduleMessage({
          context: stepResult.nextContext,
          delay,
          endpoint: `${this.baseURL}/run`,
          operationId,
          priority,
          stepIndex: nextStepIndex,
        });
        nextStepScheduled = true;

        log('[%s] Scheduled next step %d', operationId, nextStepIndex);
      }

      return {
        nextStepScheduled,
        state: stepResult.newState,
        stepResult,
        success: true,
      };
    } catch (error) {
      log('Step %d failed for operation %s: %O', stepIndex, operationId, error);

      // 发布错误事件
      await this.streamManager.publishStreamEvent(operationId, {
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
   * 获取操作状态
   */
  async getOperationStatus(params: {
    historyLimit?: number;
    includeHistory?: boolean;
    operationId: string;
  }): Promise<OperationStatusResult> {
    const { operationId, includeHistory = false, historyLimit = 10 } = params;

    try {
      log('Getting operation status for %s', operationId);

      // 获取当前状态和元数据
      const [currentState, operationMetadata] = await Promise.all([
        this.coordinator.loadAgentState(operationId),
        this.coordinator.getOperationMetadata(operationId),
      ]);

      if (!currentState || !operationMetadata) {
        throw new Error('Operation not found');
      }

      // 获取执行历史（如果需要）
      let executionHistory;
      if (includeHistory) {
        try {
          executionHistory = await this.coordinator.getExecutionHistory(operationId, historyLimit);
        } catch (error) {
          log('Failed to load execution history: %O', error);
          executionHistory = [];
        }
      }

      // 获取最近的流式事件（用于调试）
      let recentEvents;
      if (includeHistory) {
        try {
          recentEvents = await this.streamManager.getStreamHistory(operationId, 20);
        } catch (error) {
          log('Failed to load recent events: %O', error);
          recentEvents = [];
        }
      }

      // 计算操作统计信息
      const stats = {
        lastActiveTime: operationMetadata.lastActiveAt
          ? Date.now() - new Date(operationMetadata.lastActiveAt).getTime()
          : 0,
        totalCost: currentState.cost?.total || 0,
        totalMessages: currentState.messages?.length || 0,
        totalSteps: currentState.stepCount || 0,
        uptime: operationMetadata.createdAt
          ? Date.now() - new Date(operationMetadata.createdAt).getTime()
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
        metadata: operationMetadata,
        needsHumanInput: currentState.status === 'waiting_for_human',
        operationId,
        recentEvents: recentEvents?.slice(0, 10),
        stats,
      };
    } catch (error) {
      log('Failed to get operation status for %s: %O', operationId, error);
      throw error;
    }
  }

  /**
   * 获取待处理的人工干预列表
   */
  async getPendingInterventions(params: {
    operationId?: string;
    userId?: string;
  }): Promise<PendingInterventionsResult> {
    const { operationId, userId } = params;

    try {
      log('Getting pending interventions for operationId: %s, userId: %s', operationId, userId);

      let operations: string[] = [];

      if (operationId) {
        operations = [operationId];
      } else if (userId) {
        // 获取用户的所有活跃操作
        try {
          const activeOperations = await this.coordinator.getActiveOperations();

          // 过滤出属于该用户的操作
          const userOperations = [];
          for (const operation of activeOperations) {
            try {
              const metadata = await this.coordinator.getOperationMetadata(operation);
              if (metadata?.userId === userId) {
                userOperations.push(operation);
              }
            } catch (error) {
              log('Failed to get metadata for operation %s: %O', operation, error);
            }
          }
          operations = userOperations;
        } catch (error) {
          log('Failed to get active operations: %O', error);
          operations = [];
        }
      }

      // 检查每个操作的状态
      const pendingInterventions = [];

      for (const operation of operations) {
        try {
          const [state, metadata] = await Promise.all([
            this.coordinator.loadAgentState(operation),
            this.coordinator.getOperationMetadata(operation),
          ]);

          if (state?.status === 'waiting_for_human') {
            const intervention: any = {
              lastModified: state.lastModified,
              modelRuntimeConfig: metadata?.modelRuntimeConfig,
              operationId: operation,
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
          log('Failed to get state for operation %s: %O', operation, error);
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
   * 显式启动操作执行
   */
  async startExecution(params: StartExecutionParams): Promise<StartExecutionResult> {
    const { operationId, context, priority = 'normal', delay = 50 } = params;

    try {
      log('Starting execution for operation %s', operationId);

      // 检查操作是否存在
      const operationMetadata = await this.coordinator.getOperationMetadata(operationId);
      if (!operationMetadata) {
        throw new Error(`Operation ${operationId} not found`);
      }

      // 获取当前状态
      const currentState = await this.coordinator.loadAgentState(operationId);
      if (!currentState) {
        throw new Error(`Agent state not found for operation ${operationId}`);
      }

      // 检查操作状态
      if (currentState.status === 'running') {
        throw new Error(`Operation ${operationId} is already running`);
      }

      if (currentState.status === 'done') {
        throw new Error(`Operation ${operationId} is already completed`);
      }

      if (currentState.status === 'error') {
        throw new Error(`Operation ${operationId} is in error state`);
      }

      // 构建执行上下文
      let executionContext = context;
      if (!executionContext) {
        // 如果没有提供上下文，从元数据构建默认上下文
        // Note: AgentRuntimeContext requires sessionId for compatibility with @lobechat/agent-runtime
        executionContext = {
          payload: {
            isFirstMessage: true,
            message: [{ content: '' }],
          },
          phase: 'user_input' as const,
          session: {
            messageCount: currentState.messages?.length || 0,
            sessionId: operationId,
            status: 'idle' as const,
            stepCount: currentState.stepCount || 0,
          },
        };
      }

      // 更新操作状态为运行中
      await this.coordinator.saveAgentState(operationId, {
        ...currentState,
        lastModified: new Date().toISOString(),
        status: 'running',
      });

      // 调度执行
      const messageId = await this.queueService.scheduleMessage({
        context: executionContext,
        delay,
        endpoint: `${this.baseURL}/run`,
        operationId,
        priority,
        stepIndex: currentState.stepCount || 0,
      });

      log('Scheduled execution for operation %s (messageId: %s)', operationId, messageId);

      return {
        messageId,
        operationId,
        scheduled: true,
        success: true,
      };
    } catch (error) {
      log('Failed to start execution for operation %s: %O', operationId, error);
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
    operationId: string;
    rejectionReason?: string;
    stepIndex: number;
  }): Promise<{ messageId: string }> {
    const { operationId, stepIndex, action, approvedToolCall, humanInput, rejectionReason } =
      params;

    try {
      log(
        'Processing human intervention for operation %s:%d (action: %s)',
        operationId,
        stepIndex,
        action,
      );

      // 高优先级调度执行
      const messageId = await this.queueService.scheduleMessage({
        context: undefined, // 会从状态管理器中获取
        delay: 100,
        endpoint: `${this.baseURL}/run`,
        operationId,
        payload: { approvedToolCall, humanInput, rejectionReason },
        priority: 'high',
        stepIndex,
      });

      log('Scheduled immediate execution for operation %s (messageId: %s)', operationId, messageId);

      return { messageId };
    } catch (error) {
      log('Failed to process human intervention for operation %s: %O', operationId, error);
      throw error;
    }
  }

  /**
   * 创建 Agent Runtime 实例
   */
  private async createAgentRuntime({
    metadata,
    operationId,
    stepIndex,
  }: {
    metadata?: any;
    operationId: string;
    stepIndex: number;
  }) {
    // 创建 Durable Agent 实例
    const agent = new GeneralAgent({
      agentConfig: metadata?.agentConfig,
      modelRuntimeConfig: metadata?.modelRuntimeConfig,
      operationId,
      userId: metadata?.userId,
    });

    // 创建流式执行器上下文
    const executorContext: RuntimeExecutorContext = {
      messageModel: this.messageModel,
      operationId,
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
