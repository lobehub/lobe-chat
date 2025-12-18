import { AgentRuntimeContext } from '@lobechat/agent-runtime';
import { TaskStatusResult, ThreadStatus } from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import pMap from 'p-map';
import { z } from 'zod';

import { MessageModel } from '@/database/models/message';
import { ThreadModel } from '@/database/models/thread';
import { TopicModel } from '@/database/models/topic';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { AgentRuntimeService } from '@/server/services/agentRuntime';
import { AiAgentService } from '@/server/services/aiAgent';
import { AiChatService } from '@/server/services/aiChat';
import { nanoid } from '@/utils/uuid';

const log = debug('lobe-server:ai-agent-router');

// Zod schemas for agent operation
const CreateAgentOperationSchema = z.object({
  agentConfig: z.record(z.any()).optional().default({}),
  agentId: z.string().optional(),
  autoStart: z.boolean().optional().default(true),
  messages: z.array(z.any()).optional().default([]),
  modelRuntimeConfig: z.object({
    model: z.string(),
    provider: z.string(),
  }),
  threadId: z.string().optional().nullable(),
  toolManifestMap: z.record(z.string(), z.any()).default({}),
  tools: z.array(z.any()).optional(),
  topicId: z.string().optional().nullable(),
  userId: z.string().optional(),
});

const GetOperationStatusSchema = z.object({
  historyLimit: z.number().optional().default(10),
  includeHistory: z.boolean().optional().default(false),
  operationId: z.string(),
});

const ProcessHumanInterventionSchema = z.object({
  action: z.enum(['approve', 'reject', 'input', 'select']),
  data: z
    .object({
      approvedToolCall: z.any().optional(),
      input: z.any().optional(),
      selection: z.any().optional(),
    })
    .optional(),
  operationId: z.string(),
  reason: z.string().optional(),
  stepIndex: z.number().optional().default(0),
});

const GetPendingInterventionsSchema = z
  .object({
    operationId: z.string().optional(),
    userId: z.string().optional(),
  })
  .refine((data) => data.operationId || data.userId, {
    message: 'Either operationId or userId must be provided',
  });

const StartExecutionSchema = z.object({
  context: z.any().optional(),
  delay: z.number().optional().default(1000),
  operationId: z.string(),
  priority: z.enum(['high', 'normal', 'low']).optional().default('normal'),
});

/**
 * Schema for execAgent - execute a single Agent
 */
const ExecAgentSchema = z
  .object({
    /** The agent ID to run (either agentId or slug is required) */
    agentId: z.string().optional(),
    /** Application context for message storage */
    appContext: z
      .object({
        groupId: z.string().optional().nullable(),
        scope: z.string().optional().nullable(),
        sessionId: z.string().optional(),
        threadId: z.string().optional().nullable(),
        topicId: z.string().optional().nullable(),
      })
      .optional(),
    /** Whether to auto-start execution after creating operation */
    autoStart: z.boolean().optional().default(true),
    /** Optional existing message IDs to include in context */
    existingMessageIds: z.array(z.string()).optional().default([]),
    /** The user input/prompt */
    prompt: z.string(),
    /** The agent slug to run (either agentId or slug is required) */
    slug: z.string().optional(),
  })
  .refine((data) => data.agentId || data.slug, {
    message: 'Either agentId or slug must be provided',
  });

/**
 * Schema for execGroupAgent - execute Supervisor Agent in Group chat
 */
const ExecGroupAgentSchema = z.object({
  /** The Supervisor agent ID */
  agentId: z.string(),
  /** File IDs attached to the message */
  files: z.array(z.string()).optional(),
  /** The Group ID */
  groupId: z.string(),
  /** User message content */
  message: z.string(),
  /** Optional: Create a new topic */
  newTopic: z
    .object({
      title: z.string().optional(),
      topicMessageIds: z.array(z.string()).optional(),
    })
    .optional(),
  /** Existing topic ID */
  topicId: z.string().optional().nullable(),
});

/**
 * Schema for execAgents - batch execution of multiple agents
 */
const ExecAgentsSchema = z.object({
  /** Whether to execute tasks in parallel (default: true) */
  parallel: z.boolean().optional().default(true),
  /** Array of agent tasks to execute */
  tasks: z.array(ExecAgentSchema).min(1),
});

/**
 * Schema for execGroupSubAgentTask - execute SubAgent task in Group chat
 */
const ExecGroupSubAgentTaskSchema = z.object({
  /** The SubAgent ID to execute the task */
  agentId: z.string(),
  /** The Group ID (required) */
  groupId: z.string(),
  /** Task instruction/prompt for the SubAgent */
  instruction: z.string(),
  /** The parent message ID (Supervisor's tool call message) */
  parentMessageId: z.string(),
  /** Timeout in milliseconds (optional) */
  timeout: z.number().optional(),
  /** The Topic ID */
  topicId: z.string(),
});

/**
 * Schema for getTaskStatus - query task execution status
 */
const GetTaskStatusSchema = z.object({
  /** Thread ID */
  threadId: z.string(),
});

/**
 * Schema for interruptTask - interrupt a running task
 */
const InterruptTaskSchema = z
  .object({
    /** Operation ID */
    operationId: z.string().optional(),
    /** Thread ID */
    threadId: z.string().optional(),
  })
  .refine((data) => data.threadId || data.operationId, {
    message: 'Either threadId or operationId must be provided',
  });

const aiAgentProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      agentRuntimeService: new AgentRuntimeService(ctx.serverDB, ctx.userId),
      aiAgentService: new AiAgentService(ctx.serverDB, ctx.userId),
      aiChatService: new AiChatService(ctx.serverDB, ctx.userId),
      messageModel: new MessageModel(ctx.serverDB, ctx.userId),
      threadModel: new ThreadModel(ctx.serverDB, ctx.userId),
      topicModel: new TopicModel(ctx.serverDB, ctx.userId),
    },
  });
});

export const aiAgentRouter = router({
  createOperation: aiAgentProcedure
    .input(CreateAgentOperationSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        agentConfig = {},
        agentId,
        autoStart = true,
        messages = [],
        modelRuntimeConfig,
        threadId,
        topicId,
        tools,
        toolManifestMap,
      } = input;
      log('input: %O', input);

      // Validate required parameters
      if (!modelRuntimeConfig.model || !modelRuntimeConfig.provider) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'modelRuntimeConfig.model and modelRuntimeConfig.provider are required',
        });
      }

      // Generate runtime operation ID: agt_{timestamp}_{agentId}_{topicId}_{random}
      const timestamp = Date.now();
      const operationId = `agt_${timestamp}_${agentId || 'unknown'}_${topicId || 'none'}_${nanoid(8)}`;

      log(`Creating operation ${operationId} for user ${ctx.userId}`);

      // Create initial context
      const initialContext: AgentRuntimeContext = {
        payload: {},
        phase: 'user_input' as const,
        session: {
          messageCount: messages.length,
          sessionId: operationId,
          status: 'idle' as const,
          stepCount: 0,
        },
      };

      // Create operation using AgentRuntimeService
      const result = await ctx.agentRuntimeService.createOperation({
        agentConfig,
        appContext: {
          agentId,
          threadId,
          topicId,
        },
        autoStart,
        initialContext,
        initialMessages: messages,
        modelRuntimeConfig,
        operationId,
        toolManifestMap,
        tools,
        userId: ctx.userId,
      });

      let firstStepResult;
      if (result.autoStarted) {
        firstStepResult = {
          context: initialContext,
          messageId: result.messageId,
          scheduled: true,
        };

        log(
          `Operation ${operationId} created and first step scheduled (messageId: ${result.messageId})`,
        );
      } else {
        log(`Operation ${operationId} created without auto-start`);
      }

      return {
        autoStart,
        createdAt: new Date().toISOString(),
        firstStep: firstStepResult,
        operationId,
        status: 'created',
        success: true,
      };
    }),

  execAgent: aiAgentProcedure.input(ExecAgentSchema).mutation(async ({ input, ctx }) => {
    const { agentId, slug, prompt, appContext, autoStart = true, existingMessageIds = [] } = input;

    log('execAgent: identifier=%s, prompt=%s', agentId || slug, prompt.slice(0, 50));

    try {
      return await ctx.aiAgentService.execAgent({
        agentId,
        appContext,
        autoStart,
        existingMessageIds,
        prompt,
        slug,
      });
    } catch (error: any) {
      console.error('execAgent failed: %O', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to execute agent: ${error.message}`,
      });
    }
  }),

  /**
   * Batch execute multiple agents
   * Supports parallel or sequential execution
   */
  execAgents: aiAgentProcedure.input(ExecAgentsSchema).mutation(async ({ input, ctx }) => {
    const { tasks, parallel = true } = input;

    log('execAgents: %d tasks, parallel=%s', tasks.length, parallel);

    type TaskResult = {
      autoStarted?: boolean;
      error?: string;
      operationId?: string;
      success: boolean;
      taskIndex: number;
    };

    const executeTask = async (
      task: (typeof tasks)[number],
      taskIndex: number,
    ): Promise<TaskResult> => {
      const { agentId, slug, prompt, appContext, autoStart = true, existingMessageIds = [] } = task;

      try {
        const result = await ctx.aiAgentService.execAgent({
          agentId,
          appContext,
          autoStart,
          existingMessageIds,
          prompt,
          slug,
        });

        return {
          autoStarted: result.autoStarted,
          operationId: result.operationId,
          success: true,
          taskIndex,
        };
      } catch (error: any) {
        log('execAgents task %d failed: %O', taskIndex, error);

        return {
          error: error.message || 'Unknown error',
          success: false,
          taskIndex,
        };
      }
    };

    // Execute tasks with pMap for concurrency control
    // parallel=true: concurrency of 5, parallel=false: sequential (concurrency of 1)
    const concurrency = parallel ? 5 : 1;

    const results = await pMap(tasks, (task, index) => executeTask(task, index), { concurrency });

    // Calculate summary
    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      results,
      success: failed === 0,
      summary: {
        failed,
        succeeded,
        total: tasks.length,
      },
    };
  }),

  /**
   * Execute Group Agent (Supervisor) in a single call
   *
   * This endpoint combines message creation and agent execution:
   * 1. Create topic (if needed)
   * 2. Create user message
   * 3. Create assistant message placeholder
   * 4. Trigger Supervisor Agent execution
   * 5. Return operationId for SSE connection + messages for UI sync
   */
  execGroupAgent: aiAgentProcedure.input(ExecGroupAgentSchema).mutation(async ({ input, ctx }) => {
    const { agentId, groupId, message, files, topicId, newTopic } = input;

    log('execGroupAgent: agentId=%s, groupId=%s', agentId, groupId);

    try {
      // Execute group agent
      const result = await ctx.aiAgentService.execGroupAgent({
        agentId,
        files,
        groupId,
        message,
        newTopic,
        topicId,
      });

      // Get messages and topics for UI sync
      // Messages include the assistant message with error if operation failed to start
      const { messages, topics } = await ctx.aiChatService.getMessagesAndTopics({
        agentId,
        groupId,
        includeTopic: result.isCreateNewTopic,
        topicId: result.topicId,
      });

      // Return result with messages/topics - includes error/success fields
      // Frontend can check success to decide whether to connect to SSE stream
      return { ...result, messages, topics };
    } catch (error: any) {
      log('execGroupAgent failed: %O', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to execute group agent: ${error.message}`,
      });
    }
  }),

  /**
   * Execute SubAgent task in Group chat
   *
   * This endpoint is called by Supervisor to delegate tasks to SubAgents.
   * Each task runs in an isolated Thread context.
   */
  execGroupSubAgentTask: aiAgentProcedure
    .input(ExecGroupSubAgentTaskSchema)
    .mutation(async ({ input, ctx }) => {
      const { agentId, groupId, instruction, parentMessageId, topicId, timeout } = input;

      log('execGroupSubAgentTask: agentId=%s, groupId=%s', agentId, groupId);

      try {
        return await ctx.aiAgentService.execGroupSubAgentTask({
          agentId,
          groupId,
          instruction,
          parentMessageId,
          timeout,
          topicId,
        });
      } catch (error: any) {
        log('execGroupSubAgentTask failed: %O', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to execute sub-agent task: ${error.message}`,
        });
      }
    }),

  getOperationStatus: aiAgentProcedure
    .input(GetOperationStatusSchema)
    .query(async ({ input, ctx }) => {
      const { historyLimit, includeHistory, operationId } = input;

      if (!operationId) {
        throw new Error('operationId parameter is required');
      }

      log('Getting operation status for %s', operationId);

      // Get operation status using AgentRuntimeService
      const operationStatus = await ctx.agentRuntimeService.getOperationStatus({
        historyLimit,
        includeHistory,
        operationId,
      });

      return operationStatus;
    }),

  getPendingInterventions: aiAgentProcedure
    .input(GetPendingInterventionsSchema)
    .query(async ({ input, ctx }) => {
      const { operationId, userId } = input;

      log('Getting pending interventions for operationId: %s, userId: %s', operationId, userId);

      // Get pending interventions using AgentRuntimeService
      const result = await ctx.agentRuntimeService.getPendingInterventions({
        operationId: operationId || undefined,
        userId: userId || undefined,
      });

      return result;
    }),

  /**
   * Get task execution status
   *
   * This endpoint queries the status of a SubAgent task by threadId.
   * It queries from Thread table (PostgreSQL) for persistence,
   * and optionally supplements with real-time status from Redis if available.
   */
  getTaskStatus: aiAgentProcedure.input(GetTaskStatusSchema).query(async ({ input, ctx }) => {
    const { threadId } = input;

    log('getTaskStatus: threadId=%s', threadId);

    // 1. Find thread by threadId
    const thread = await ctx.threadModel.findById(threadId);

    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Thread not found',
      });
    }

    // 2. Map Thread status to task status
    const threadStatusToTaskStatus: Record<string, TaskStatusResult['status']> = {
      [ThreadStatus.Active]: 'processing',
      [ThreadStatus.Cancel]: 'cancel',
      [ThreadStatus.Completed]: 'completed',
      [ThreadStatus.Failed]: 'failed',
      [ThreadStatus.InReview]: 'processing',
      [ThreadStatus.Pending]: 'processing',
      [ThreadStatus.Processing]: 'processing',
      [ThreadStatus.Todo]: 'processing',
    };

    const taskStatus = threadStatusToTaskStatus[thread.status] || 'processing';
    const metadata = thread.metadata;

    // 3. Build TaskDetail from Thread (uses ThreadStatus)
    const taskDetail = {
      completedAt: metadata?.completedAt,
      duration: metadata?.duration,
      error: metadata?.error,
      startedAt: metadata?.startedAt,
      status: thread.status,
      threadId: thread.id,
      title: thread.title,
      totalCost: metadata?.totalCost,
      totalMessages: metadata?.totalMessages,
      totalTokens: metadata?.totalTokens,
      totalToolCalls: metadata?.totalToolCalls,
    };

    // 4. Try to get real-time status from Redis (optional, for active tasks)
    let realtimeStatus;
    const resolvedOperationId = metadata?.operationId;
    if (resolvedOperationId && taskStatus === 'processing') {
      try {
        realtimeStatus = await ctx.agentRuntimeService.getOperationStatus({
          operationId: resolvedOperationId,
        });
        log('getTaskStatus: got realtime status from Redis');
      } catch {
        // Redis status not available (expired or local mode), use Thread data only
        log('getTaskStatus: Redis status not available, using Thread data only');
      }
    }

    // 5. Build result, preferring real-time data if available
    const result: TaskStatusResult = {
      completedAt: metadata?.completedAt,
      cost:
        realtimeStatus?.currentState?.cost ??
        (metadata?.totalCost ? { total: metadata.totalCost } : undefined),
      error: metadata?.error ?? realtimeStatus?.currentState?.error,
      status: taskStatus,
      stepCount: realtimeStatus?.currentState?.stepCount,
      taskDetail,
      usage:
        realtimeStatus?.currentState?.usage ??
        (metadata?.totalTokens ? { total_tokens: metadata.totalTokens } : undefined),
    };

    return result;
  }),

  /**
   * Interrupt a running task
   *
   * This endpoint interrupts a SubAgent task by threadId or operationId.
   * It updates both operation status and Thread status to cancelled state.
   */
  interruptTask: aiAgentProcedure.input(InterruptTaskSchema).mutation(async ({ input, ctx }) => {
    const { threadId, operationId } = input;

    log('interruptTask: threadId=%s, operationId=%s', threadId, operationId);

    try {
      return await ctx.aiAgentService.interruptTask({ operationId, threadId });
    } catch (error: any) {
      if (error.message === 'Thread not found') {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread not found' });
      }
      if (error.message === 'Operation ID not found') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Operation ID not found' });
      }
      throw error;
    }
  }),

  processHumanIntervention: aiAgentProcedure
    .input(ProcessHumanInterventionSchema)
    .mutation(async ({ input, ctx }) => {
      const { operationId, action, data, reason, stepIndex } = input;

      log(`Processing ${action} for operation ${operationId}`);

      // Build intervention parameters
      let interventionParams: any = {
        action,
        operationId,
        stepIndex,
      };

      switch (action) {
        case 'approve': {
          if (!data?.approvedToolCall) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'approvedToolCall is required for approve action',
            });
          }
          interventionParams.approvedToolCall = data.approvedToolCall;
          break;
        }
        case 'reject': {
          interventionParams.rejectionReason = reason || 'Tool call rejected by user';
          break;
        }
        case 'input': {
          if (!data?.input) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'input is required for input action',
            });
          }
          interventionParams.humanInput = { response: data.input };
          break;
        }
        case 'select': {
          if (!data?.selection) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'selection is required for select action',
            });
          }
          interventionParams.humanInput = { selection: data.selection };
          break;
        }
      }

      // Process human intervention using AgentRuntimeService
      const result = await ctx.agentRuntimeService.processHumanIntervention(interventionParams);

      return {
        action,
        message: `Human intervention processed successfully. Execution resumed.`,
        operationId,
        scheduledMessageId: result.messageId,
        success: true,
        timestamp: new Date().toISOString(),
      };
    }),

  startExecution: aiAgentProcedure.input(StartExecutionSchema).mutation(async ({ input, ctx }) => {
    const { operationId, context, priority, delay } = input;

    log('Starting execution for operation %s', operationId);

    // Start execution using AgentRuntimeService
    const result = await ctx.agentRuntimeService.startExecution({
      context,
      delay,
      operationId,
      priority,
    });

    return {
      ...result,
      message: 'Agent execution started successfully',
      timestamp: new Date().toISOString(),
    };
  }),
});
