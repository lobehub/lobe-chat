import { AgentRuntimeContext } from '@lobechat/agent-runtime';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import { z } from 'zod';

import { isEnableAgent } from '@/app/(backend)/api/agent/isEnableAgent';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { AgentRuntimeService } from '@/server/services/agentRuntime';
import { AiAgentService } from '@/server/services/aiAgent';

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
 * Schema for execAgent - simplified API that requires agent identifier (id or slug) and prompt
 * All other data (agent config, tools, messages) will be fetched from database
 */
const ExecAgentSchema = z
  .object({
    /** The agent ID to run (either agentId or slug is required) */
    agentId: z.string().optional(),
    /** Application context for message storage */
    appContext: z
      .object({
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

const aiAgentProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      agentRuntimeService: new AgentRuntimeService(ctx.serverDB, ctx.userId),
      aiAgentService: new AiAgentService(ctx.serverDB, ctx.userId),
    },
  });
});

export const aiAgentRouter = router({
  createOperation: aiAgentProcedure
    .input(CreateAgentOperationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!isEnableAgent()) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
      }

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

      // Generate runtime operation ID
      const operationId = `agent_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

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
    if (!isEnableAgent()) {
      throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
    }

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
      log('execAgent failed: %O', error);

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

  getOperationStatus: aiAgentProcedure
    .input(GetOperationStatusSchema)
    .query(async ({ input, ctx }) => {
      if (!isEnableAgent()) {
        throw new Error('Agent features are not enabled');
      }

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
      if (!isEnableAgent()) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
      }

      const { operationId, userId } = input;

      log('Getting pending interventions for operationId: %s, userId: %s', operationId, userId);

      // Get pending interventions using AgentRuntimeService
      const result = await ctx.agentRuntimeService.getPendingInterventions({
        operationId: operationId || undefined,
        userId: userId || undefined,
      });

      return result;
    }),

  processHumanIntervention: aiAgentProcedure
    .input(ProcessHumanInterventionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!isEnableAgent()) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
      }

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
    if (!isEnableAgent()) {
      throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
    }

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
