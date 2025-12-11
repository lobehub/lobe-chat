import { AgentRuntimeContext } from '@lobechat/agent-runtime';
import { LobeChatDatabase } from '@lobechat/database';
import type {
  ExecAgentParams,
  ExecAgentResult,
  ExecGroupAgentParams,
  ExecGroupAgentResult,
} from '@lobechat/types';
import { nanoid } from '@lobechat/utils';
import debug from 'debug';

import { LOADING_FLAT } from '@/const/message';
import { AgentModel } from '@/database/models/agent';
import { MessageModel } from '@/database/models/message';
import { PluginModel } from '@/database/models/plugin';
import { TopicModel } from '@/database/models/topic';
import {
  type ServerAgentToolsContext,
  createServerAgentToolsEngine,
  serverMessagesEngine,
} from '@/server/modules/Mecha';
import { AgentRuntimeService } from '@/server/services/agentRuntime';

const log = debug('lobe-server:ai-agent-service');

/**
 * AI Agent Service
 *
 * Encapsulates agent execution logic that can be triggered via:
 * - tRPC router (aiAgent.execAgent)
 * - REST API endpoint (/api/agent)
 * - Cron jobs / scheduled tasks
 */
export class AiAgentService {
  private readonly userId: string;
  private readonly db: LobeChatDatabase;
  private readonly agentModel: AgentModel;
  private readonly messageModel: MessageModel;
  private readonly pluginModel: PluginModel;
  private readonly topicModel: TopicModel;
  private readonly agentRuntimeService: AgentRuntimeService;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.agentModel = new AgentModel(db, userId);
    this.messageModel = new MessageModel(db, userId);
    this.pluginModel = new PluginModel(db, userId);
    this.topicModel = new TopicModel(db, userId);
    this.agentRuntimeService = new AgentRuntimeService(db, userId);
  }

  /**
   * Execute agent with just a prompt
   *
   * This is a simplified API that requires agent identifier (id or slug) and prompt.
   * All necessary data (agent config, tools, messages) will be fetched from the database.
   *
   * Architecture:
   * execAgent({ agentId | slug, prompt })
   *   → AgentModel.getAgentConfig(idOrSlug)
   *   → ServerMechaModule.AgentToolsEngine(config)
   *   → ServerMechaModule.ContextEngineering(input, config, messages)
   *   → AgentRuntimeService.createOperation(...)
   */
  async execAgent(params: ExecAgentParams): Promise<ExecAgentResult> {
    const { agentId, slug, prompt, appContext, autoStart = true, existingMessageIds = [] } = params;

    // Validate that either agentId or slug is provided
    if (!agentId && !slug) {
      throw new Error('Either agentId or slug must be provided');
    }

    // Determine the identifier to use (agentId takes precedence)
    const identifier = agentId || slug!;

    log('execAgent: identifier=%s, prompt=%s', identifier, prompt.slice(0, 50));

    // 1. Get agent configuration from database (supports both id and slug)
    const agentConfig = await this.agentModel.getAgentConfig(identifier);
    if (!agentConfig) {
      throw new Error(`Agent not found: ${identifier}`);
    }

    // Use actual agent ID from config for subsequent operations
    const resolvedAgentId = agentConfig.id;

    log('execAgent: got agent config for %s (id: %s)', identifier, resolvedAgentId);

    // 2. Handle topic creation: if no topicId provided, create a new topic; otherwise reuse existing
    let topicId = appContext?.topicId;
    if (!topicId) {
      const newTopic = await this.topicModel.create({
        agentId: resolvedAgentId,
        title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      });
      topicId = newTopic.id;
      log('execAgent: created new topic %s', topicId);
    } else {
      log('execAgent: reusing existing topic %s', topicId);
    }

    // Extract model and provider from agent config
    const model = agentConfig.model!;
    const provider = agentConfig.provider!;

    // 3. Get installed plugins from database
    const installedPlugins = await this.pluginModel.query();
    log('execAgent: got %d installed plugins', installedPlugins.length);

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
      agentConfig.knowledgeBases?.some((kb: { enabled?: boolean | null }) => kb.enabled === true) ??
      false;

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

    log('execAgent: generated %d tools', tools?.length ?? 0);

    // 6. Get existing messages if provided
    let historyMessages: any[] = [];
    if (existingMessageIds.length > 0) {
      historyMessages = await this.messageModel.query({
        sessionId: appContext?.sessionId,
        topicId: appContext?.topicId ?? undefined,
      });
      if (existingMessageIds.length > 0) {
        const idSet = new Set(existingMessageIds);
        historyMessages = historyMessages.filter((msg) => idSet.has(msg.id));
      }
    }

    // 7. Create user message in database
    const userMessageRecord = await this.messageModel.create({
      agentId: resolvedAgentId,
      content: prompt,
      role: 'user',
      topicId,
    });
    log('execAgent: created user message %s', userMessageRecord.id);

    // 8. Create assistant message placeholder in database
    const assistantMessageRecord = await this.messageModel.create({
      agentId: resolvedAgentId,
      content: LOADING_FLAT,
      model,
      parentId: userMessageRecord.id,
      provider,
      role: 'assistant',
      topicId,
    });
    log('execAgent: created assistant message %s', assistantMessageRecord.id);

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

    log('execAgent: processed %d messages', processedMessages.length);

    // 10. Generate operation ID: agt_{timestamp}_{agentId}_{topicId}_{random}
    const timestamp = Date.now();
    const operationId = `op_${timestamp}_${resolvedAgentId}_${topicId}_${nanoid(8)}`;

    // 11. Create initial context
    const initialContext: AgentRuntimeContext = {
      payload: {
        // Pass assistant message ID so agent runtime knows which message to update
        assistantMessageId: assistantMessageRecord.id,
        isFirstMessage: true,
        message: [{ content: prompt }],
        // Pass user message ID as parentMessageId for reference
        parentMessageId: userMessageRecord.id,
        // Include tools for initial LLM call
        tools,
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
    const result = await this.agentRuntimeService.createOperation({
      agentConfig,
      appContext: {
        agentId: resolvedAgentId,
        groupId: appContext?.groupId,
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
      userId: this.userId,
    });

    log('execAgent: created operation %s (autoStarted: %s)', operationId, result.autoStarted);

    return {
      agentId: resolvedAgentId,
      assistantMessageId: assistantMessageRecord.id,
      autoStarted: result.autoStarted,
      createdAt: new Date().toISOString(),
      message: 'Agent operation created successfully',
      messageId: result.messageId,
      operationId,
      status: 'created',
      success: true,
      timestamp: new Date().toISOString(),
      topicId,
      userMessageId: userMessageRecord.id,
    };
  }

  /**
   * Execute Group Agent (Supervisor) in a single call
   *
   * This method handles Group-specific logic (topic with groupId) and delegates
   * the core agent execution to execAgent.
   *
   * Flow:
   * 1. Create topic with groupId (if needed)
   * 2. Delegate to execAgent for the rest
   */
  async execGroupAgent(params: ExecGroupAgentParams): Promise<ExecGroupAgentResult> {
    const { agentId, groupId, message, topicId: inputTopicId, newTopic } = params;

    log(
      'execGroupAgent: agentId=%s, groupId=%s, message=%s',
      agentId,
      groupId,
      message.slice(0, 50),
    );

    // 1. Create topic with groupId if needed
    let topicId = inputTopicId;
    let isCreateNewTopic = false;

    // Create new topic when:
    // - newTopic is explicitly provided, OR
    // - no topicId is provided (default behavior for group chat)
    if (newTopic || !inputTopicId) {
      const topicTitle =
        newTopic?.title || message.slice(0, 50) + (message.length > 50 ? '...' : '');
      const topicItem = await this.topicModel.create({
        agentId,
        groupId,
        messages: newTopic?.topicMessageIds,
        title: topicTitle,
      });
      topicId = topicItem.id;
      isCreateNewTopic = true;
      log('execGroupAgent: created new topic %s with groupId %s', topicId, groupId);
    }

    // 2. Delegate to execAgent with groupId in appContext
    const result = await this.execAgent({
      agentId,
      appContext: { groupId, topicId },
      autoStart: true,
      prompt: message,
    });

    log('execGroupAgent: delegated to execAgent, operationId=%s', result.operationId);

    return {
      assistantMessageId: result.assistantMessageId,
      isCreateNewTopic,
      operationId: result.operationId,
      topicId: result.topicId,
      userMessageId: result.userMessageId,
    };
  }
}
