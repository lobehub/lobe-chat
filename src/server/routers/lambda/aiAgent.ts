import { AgentRuntimeContext } from '@lobechat/agent-runtime';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import { z } from 'zod';

import { isEnableAgent } from '@/app/(backend)/api/agent/isEnableAgent';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { AgentRuntimeService } from '@/server/services/agentRuntime';

const log = debug('lobe-server:ai-agent-router');

// Zod schemas for agent session operations
const CreateAgentSessionSchema = z.object({
  agentConfig: z.record(z.any()).optional().default({}),
  agentSessionId: z.string().optional(),
  autoStart: z.boolean().optional().default(true),
  messages: z.array(z.any()).optional().default([]),
  modelRuntimeConfig: z.object({
    model: z.string(),
    provider: z.string(),
  }),
  threadId: z.string().optional().nullable(),
  tools: z.array(z.any()).optional(),
  topicId: z.string().optional().nullable(),
  userId: z.string().optional(),
});

const GetSessionStatusSchema = z.object({
  historyLimit: z.number().optional().default(10),
  includeHistory: z.boolean().optional().default(false),
  sessionId: z.string(),
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
  reason: z.string().optional(),
  sessionId: z.string(),
  stepIndex: z.number().optional().default(0),
});

const GetPendingInterventionsSchema = z
  .object({
    sessionId: z.string().optional(),
    userId: z.string().optional(),
  })
  .refine((data) => data.sessionId || data.userId, {
    message: 'Either sessionId or userId must be provided',
  });

const StartExecutionSchema = z.object({
  context: z.any().optional(),
  delay: z.number().optional().default(1000),
  priority: z.enum(['high', 'normal', 'low']).optional().default('normal'),
  sessionId: z.string(),
});

const aiAgentProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      agentRuntimeService: new AgentRuntimeService(ctx.serverDB, ctx.userId),
    },
  });
});

export const aiAgentRouter = router({
  createSession: aiAgentProcedure
    .input(CreateAgentSessionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!isEnableAgent()) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
      }

      const {
        agentConfig = {},
        agentSessionId,
        autoStart = true,
        messages = [],
        modelRuntimeConfig,
        threadId,
        topicId,
        tools,
      } = input;
      log('input: %O', input);

      // Validate required parameters
      if (!modelRuntimeConfig.model || !modelRuntimeConfig.provider) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'modelRuntimeConfig.model and modelRuntimeConfig.provider are required',
        });
      }

      // Generate runtime session ID
      const runtimeSessionId = `agent_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      log(`Creating session ${runtimeSessionId} for user ${ctx.userId}`);

      // Create initial context
      const initialContext: AgentRuntimeContext = {
        payload: {},
        phase: 'user_input' as const,
        session: {
          messageCount: messages.length,
          sessionId: runtimeSessionId,
          status: 'idle' as const,
          stepCount: 0,
        },
      };

      // Create session using AgentRuntimeService
      const result = await ctx.agentRuntimeService.createSession({
        agentConfig,
        appContext: {
          sessionId: agentSessionId,
          threadId,
          topicId,
        },
        autoStart,
        initialContext,
        initialMessages: messages,
        modelRuntimeConfig,
        sessionId: runtimeSessionId,
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
          `Session ${runtimeSessionId} created and first step scheduled (messageId: ${result.messageId})`,
        );
      } else {
        log(`Session ${runtimeSessionId} created without auto-start`);
      }

      return {
        autoStart,
        createdAt: new Date().toISOString(),
        firstStep: firstStepResult,
        sessionId: runtimeSessionId,
        status: 'created',
        success: true,
      };
    }),

  getPendingInterventions: aiAgentProcedure
    .input(GetPendingInterventionsSchema)
    .query(async ({ input, ctx }) => {
      if (!isEnableAgent()) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
      }

      const { sessionId, userId } = input;

      log('Getting pending interventions for sessionId: %s, userId: %s', sessionId, userId);

      // Get pending interventions using AgentRuntimeService
      const result = await ctx.agentRuntimeService.getPendingInterventions({
        sessionId: sessionId || undefined,
        userId: userId || undefined,
      });

      return result;
    }),

  getSessionStatus: aiAgentProcedure.input(GetSessionStatusSchema).query(async ({ input, ctx }) => {
    if (!isEnableAgent()) {
      throw new Error('Agent features are not enabled');
    }

    const { historyLimit, includeHistory, sessionId } = input;

    if (!sessionId) {
      throw new Error('sessionId parameter is required');
    }

    log('Getting session status for %s', sessionId);

    // Get session status using AgentRuntimeService
    const sessionStatus = await ctx.agentRuntimeService.getSessionStatus({
      historyLimit,
      includeHistory,
      sessionId,
    });

    return sessionStatus;
  }),

  processHumanIntervention: aiAgentProcedure
    .input(ProcessHumanInterventionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!isEnableAgent()) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
      }

      const { sessionId, action, data, reason, stepIndex } = input;

      log(`Processing ${action} for session ${sessionId}`);

      // Build intervention parameters
      let interventionParams: any = {
        action,
        sessionId,
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
        scheduledMessageId: result.messageId,
        sessionId,
        success: true,
        timestamp: new Date().toISOString(),
      };
    }),

  startExecution: aiAgentProcedure.input(StartExecutionSchema).mutation(async ({ input, ctx }) => {
    if (!isEnableAgent()) {
      throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
    }

    const { sessionId, context, priority, delay } = input;

    log('Starting execution for session %s', sessionId);

    // Start execution using AgentRuntimeService
    const result = await ctx.agentRuntimeService.startExecution({
      context,
      delay,
      priority,
      sessionId,
    });

    return {
      ...result,
      message: 'Agent execution started successfully',
      timestamp: new Date().toISOString(),
    };
  }),
});
