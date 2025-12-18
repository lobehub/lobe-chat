import { AgentRuntimeContext } from '@lobechat/agent-runtime';
import { TaskStatusResult, ThreadStatus } from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import pMap from 'p-map';
import { z } from 'zod';

import { isEnableAgent } from '@/app/(backend)/api/agent/isEnableAgent';
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
const GetTaskStatusSchema = z
  .object({
    /** Operation ID */
    operationId: z.string().optional(),
    /** Thread ID */
    threadId: z.string().optional(),
  })
  .refine((data) => data.threadId || data.operationId, {
    message: 'Either threadId or operationId must be provided',
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
  // Check if agent features are enabled
  if (!isEnableAgent()) {
    throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
  }

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
   * This endpoint queries the status of a SubAgent task by threadId or operationId.
   * It maps operation status to task status and syncs Thread status when task completes.
   */
getTaskStatus: aiAgentProcedure.input(GetTaskStatusSchema).query(async ({ input, ctx }) => {
    const { threadId, operationId } = input;

    log('getTaskStatus: threadId=%s, operationId=%s', threadId, operationId);

    // 1. Get operationId from thread if only threadId is provided
    let resolvedOperationId = operationId;
    let thread;

    if (threadId && !operationId) {
      thread = await ctx.threadModel.findById(threadId);
      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread not found' });
      }
      resolvedOperationId = thread.metadata?.operationId;
      if (!resolvedOperationId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Operation ID not found in thread' });
      }
    }

    // 2. Get operation status
    let operationStatus;
    try {
      operationStatus = await ctx.agentRuntimeService.getOperationStatus({
        operationId: resolvedOperationId!,
      });
    } catch (error: any) {
      log('getTaskStatus: getOperationStatus failed: %O', error);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Operation not found: ${resolvedOperationId}`,
      });
    }

    // 3. Map operation status to task status
    const currentState = operationStatus.currentState;
    const statusMap: Record<string, TaskStatusResult['status']> = {
      done: 'completed',
      error: 'failed',
      idle: 'processing',
      interrupted: 'cancel',
      running: 'processing',
      waiting_for_human: 'processing',
    };

    const taskStatus: TaskStatusResult = {
      completedAt: operationStatus.isCompleted ? operationStatus.metadata?.lastActiveAt : undefined,
      cost: currentState?.cost,
      error: operationStatus.hasError ? currentState?.error : undefined,
      // Note: result content would need to be fetched from assistant message if needed
      // For now, we rely on thread metadata or message queries for full result
      status: statusMap[currentState?.status || 'idle'] || 'processing',
      stepCount: currentState?.stepCount,
      usage: currentState?.usage,
    };

    // 4. Sync Thread status if task is in terminal state
    if (thread && ['completed', 'failed', 'cancel'].includes(taskStatus.status)) {
      const threadStatusMap: Record<string, ThreadStatus> = {
        cancel: ThreadStatus.Cancel,
        completed: ThreadStatus.Completed,
        failed: ThreadStatus.Failed,
      };

      await ctx.threadModel.update(thread.id, {
        metadata: {
          ...thread.metadata,
          completedAt: taskStatus.completedAt || new Date().toISOString(),
          error: taskStatus.error,
        },
        status: threadStatusMap[taskStatus.status],
      });
    }

    return taskStatus;
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
