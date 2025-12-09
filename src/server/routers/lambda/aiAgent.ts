import { AgentRuntimeContext } from '@lobechat/agent-runtime';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import { z } from 'zod';

import { isEnableAgent } from '@/app/(backend)/api/workflows/agent/isEnableAgent';
import { AgentModel } from '@/database/models/agent';
import { MessageModel } from '@/database/models/message';
import { PluginModel } from '@/database/models/plugin';
import { TopicModel } from '@/database/models/topic';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import {
  type ServerAgentToolsContext,
  createServerAgentToolsEngine,
  serverMessagesEngine,
} from '@/server/modules/Mecha';
import { AgentRuntimeService } from '@/server/services/agentRuntime';

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
 * Schema for runByAgentId - simplified API that only requires agentId and prompt
 * All other data (agent config, tools, messages) will be fetched from database
 */
const RunByAgentIdSchema = z.object({
  /** The agent ID to run */
  agentId: z.string(),
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
});

const aiAgentProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      agentModel: new AgentModel(ctx.serverDB, ctx.userId),
      agentRuntimeService: new AgentRuntimeService(ctx.serverDB, ctx.userId),
      messageModel: new MessageModel(ctx.serverDB, ctx.userId),
      pluginModel: new PluginModel(ctx.serverDB, ctx.userId),
      topicModel: new TopicModel(ctx.serverDB, ctx.userId),
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

  /**
   * Run agent by agent ID with just a prompt
   *
   * This is a simplified API that only requires agentId and prompt.
   * All necessary data (agent config, tools, messages) will be fetched from the database.
   *
   * Architecture:
   * runByAgentId(agentId, prompt)
   *   → AgentModel.getAgentConfigById(agentId)
   *   → ServerMechaModule.AgentToolsEngine(config)
   *   → ServerMechaModule.ContextEngineering(input, config, messages)
   *   → AgentRuntimeService.createOperation(...)
   */
  runByAgentId: aiAgentProcedure.input(RunByAgentIdSchema).mutation(async ({ input, ctx }) => {
    if (!isEnableAgent()) {
      throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Agent features are not enabled' });
    }

    const { agentId, prompt, appContext, autoStart = true, existingMessageIds = [] } = input;

    log('runByAgentId: agentId=%s, prompt=%s', agentId, prompt.slice(0, 50));

    try {
      // 1. Get agent configuration from database
      const agentConfig = await ctx.agentModel.getAgentConfigById(agentId);
      if (!agentConfig) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Agent not found: ${agentId}`,
        });
      }

      log('runByAgentId: got agent config for %s', agentId);

      // 2. Handle topic creation: if no topicId provided, create a new topic; otherwise reuse existing
      let topicId = appContext?.topicId;
      if (!topicId) {
        const newTopic = await ctx.topicModel.create({
          agentId,
          title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        });
        topicId = newTopic.id;
        log('runByAgentId: created new topic %s', topicId);
      } else {
        log('runByAgentId: reusing existing topic %s', topicId);
      }

      // Extract model and provider from agent config
      const model = agentConfig.model!;
      const provider = agentConfig.provider!;

      // 3. Get installed plugins from database
      const installedPlugins = await ctx.pluginModel.query();
      log('runByAgentId: got %d installed plugins', installedPlugins.length);

      // 4. Get model abilities from model-bank for function calling support check
      const { LOBE_DEFAULT_MODEL_LIST } = await import('model-bank');
      const modelInfo = LOBE_DEFAULT_MODEL_LIST.find(
        (m) => m.id === model && m.providerId === provider,
      );
      const isModelSupportToolUse = (m: string, p: string) => {
        const info = LOBE_DEFAULT_MODEL_LIST.find((item) => item.id === m && item.providerId === p);
        return info?.abilities?.functionCall ?? true;
      };

      // 5. Create tools using Server AgentToolsEngine
      const hasEnabledKnowledgeBases =
        agentConfig.knowledgeBases?.some(
          (kb: { enabled?: boolean | null }) => kb.enabled === true,
        ) ?? false;

      const toolsContext: ServerAgentToolsContext = {
        installedPlugins,
        isModelSupportToolUse,
      };

      const toolsEngine = createServerAgentToolsEngine(toolsContext, {
        agentConfig: {
          chatConfig: agentConfig.chatConfig ?? undefined,
          plugins: agentConfig.plugins ?? undefined,
        },
        hasEnabledKnowledgeBases,
        model,
        provider,
      });

      // Generate tools and manifest map
      const pluginIds = agentConfig.plugins || [];
      const toolsResult = toolsEngine.generateToolsDetailed({
        model,
        provider,
        toolIds: pluginIds,
      });

      const tools = toolsResult.tools;

      // Get manifest map and convert from Map to Record
      const manifestMap = toolsEngine.getEnabledPluginManifests(pluginIds);
      const toolManifestMap: Record<string, any> = {};
      manifestMap.forEach((manifest, id) => {
        toolManifestMap[id] = manifest;
      });

      log('runByAgentId: generated %d tools', tools?.length ?? 0);

      // 6. Get existing messages if provided
      let historyMessages: any[] = [];
      if (existingMessageIds.length > 0) {
        historyMessages = await ctx.messageModel.query({
          sessionId: appContext?.sessionId,
          topicId: appContext?.topicId ?? undefined,
        });
        if (existingMessageIds.length > 0) {
          const idSet = new Set(existingMessageIds);
          historyMessages = historyMessages.filter((msg) => idSet.has(msg.id));
        }
      }

      // 7. Create user message in database
      const userMessageRecord = await ctx.messageModel.create({
        agentId,
        content: prompt,
        role: 'user',
        topicId,
      });
      log('runByAgentId: created user message %s', userMessageRecord.id);

      // 8. Create assistant message placeholder in database
      const assistantMessageRecord = await ctx.messageModel.create({
        agentId,
        content: '',
        model,
        parentId: userMessageRecord.id,
        provider,
        role: 'assistant',
        topicId,
      });
      log('runByAgentId: created assistant message placeholder %s', assistantMessageRecord.id);

      // Create user message object for processing
      const userMessage = { content: prompt, role: 'user' as const };

      // Combine history messages with user message
      const allMessages = [...historyMessages, userMessage];

      // 9. Process messages using Server ContextEngineering
      const processedMessages = await serverMessagesEngine({
        capabilities: {
          isCanUseFC: isModelSupportToolUse,
          isCanUseVideo: () => modelInfo?.abilities?.video ?? false,
          isCanUseVision: () => modelInfo?.abilities?.vision ?? true,
        },
        enableHistoryCount: agentConfig.chatConfig?.enableHistoryCount ?? undefined,
        historyCount: agentConfig.chatConfig?.historyCount ?? undefined,
        knowledge: {
          fileContents: agentConfig.files
            ?.filter((f: { enabled?: boolean | null }) => f.enabled === true)
            .map((f: { content?: string | null; id?: string; name?: string }) => ({
              content: f.content ?? '',
              fileId: f.id ?? '',
              filename: f.name ?? '',
            })),
          knowledgeBases: agentConfig.knowledgeBases
            ?.filter((kb: { enabled?: boolean | null }) => kb.enabled === true)
            .map((kb: { id?: string; name?: string }) => ({
              id: kb.id ?? '',
              name: kb.name ?? '',
            })),
        },
        messages: allMessages,
        model,
        provider,
        systemRole: agentConfig.systemRole ?? undefined,
        toolsConfig: {
          tools: pluginIds,
        },
      });

      log('runByAgentId: processed %d messages', processedMessages.length);

      // 10. Generate operation ID
      const operationId = `agent_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      // 11. Create initial context
      const initialContext: AgentRuntimeContext = {
        payload: {
          isFirstMessage: true,
          message: [{ content: prompt }],
        },
        phase: 'user_input' as const,
        session: {
          messageCount: processedMessages.length,
          sessionId: operationId,
          status: 'idle' as const,
          stepCount: 0,
        },
      };

      // 12. Create operation using AgentRuntimeService
      const result = await ctx.agentRuntimeService.createOperation({
        agentConfig,
        appContext: {
          agentId,
          threadId: appContext?.threadId,
          topicId,
        },
        autoStart,
        initialContext,
        initialMessages: processedMessages,
        modelRuntimeConfig: { model, provider },
        operationId,
        toolManifestMap,
        tools,
        userId: ctx.userId,
      });

      log('runByAgentId: created operation %s (autoStarted: %s)', operationId, result.autoStarted);

      return {
        autoStarted: result.autoStarted,
        createdAt: new Date().toISOString(),
        message: 'Agent operation created successfully',
        messageId: result.messageId,
        operationId,
        status: 'created',
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      log('runByAgentId failed: %O', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to run agent: ${error.message}`,
      });
    }
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
