/* eslint-disable sort-keys-fix/sort-keys-fix */
import debug from 'debug';

import type { OpenAIChatMessage } from '@/types/index';

import { ContextEngine } from '../../pipeline';
import {
  AgentCouncilFlattenProcessor,
  GroupMessageFlattenProcessor,
  GroupMessageSenderProcessor,
  HistoryTruncateProcessor,
  InputTemplateProcessor,
  MessageCleanupProcessor,
  MessageContentProcessor,
  PlaceholderVariablesProcessor,
  SupervisorRoleRestoreProcessor,
  ToolCallProcessor,
  ToolMessageReorder,
} from '../../processors';
import {
  AgentBuilderContextInjector,
  GroupAgentBuilderContextInjector,
  GroupContextInjector,
  HistorySummaryProvider,
  KnowledgeInjector,
  SystemRoleInjector,
  ToolSystemRoleProvider,
  UserMemoryInjector,
} from '../../providers';
import type { ContextProcessor } from '../../types';
import { ToolNameResolver } from '../tools';
import type { MessagesEngineParams, MessagesEngineResult } from './types';

const log = debug('context-engine:MessagesEngine');

/**
 * MessagesEngine - High-level message processing engine
 *
 * This is a convenience wrapper around ContextEngine that provides
 * a pre-configured pipeline for common message processing scenarios.
 * It can be used by both frontend and backend through dependency injection.
 *
 * @example
 * ```typescript
 * const engine = new MessagesEngine({
 *   messages,
 *   model: 'gpt-4',
 *   provider: 'openai',
 *   systemRole: 'You are a helpful assistant',
 *   capabilities: {
 *     isCanUseFC: (m, p) => true,
 *     isCanUseVision: (m, p) => true,
 *   },
 * });
 *
 * const result = await engine.process();
 * console.log(result.messages);
 * ```
 */
export class MessagesEngine {
  private params: MessagesEngineParams;
  private toolNameResolver: ToolNameResolver;

  constructor(params: MessagesEngineParams) {
    this.params = params;
    this.toolNameResolver = new ToolNameResolver();
  }

  /**
   * Process messages and return OpenAI-compatible format
   */
  async process(): Promise<MessagesEngineResult> {
    const pipeline = this.buildPipeline();
    const result = await pipeline.process({ messages: this.params.messages });

    return {
      messages: result.messages as OpenAIChatMessage[],
      metadata: result.metadata,
      stats: result.stats,
    };
  }

  /**
   * Process messages and return only the messages array
   * This is a convenience method for simpler use cases
   */
  async processMessages(): Promise<OpenAIChatMessage[]> {
    const result = await this.process();
    return result.messages;
  }

  /**
   * Build the processing pipeline based on configuration
   */
  private buildPipeline(): ContextEngine {
    const processors = this.buildProcessors();
    log(`Built pipeline with ${processors.length} processors`);
    return new ContextEngine({ pipeline: processors });
  }

  /**
   * Build the list of processors based on configuration
   */
  private buildProcessors(): ContextProcessor[] {
    const {
      model,
      provider,
      systemRole,
      inputTemplate,
      enableHistoryCount,
      historyCount,
      historySummary,
      formatHistorySummary,
      knowledge,
      toolsConfig,
      capabilities,
      variableGenerators,
      fileContext,
      agentBuilderContext,
      groupAgentBuilderContext,
      agentGroup,
      userMemory,
    } = this.params;

    const isAgentBuilderEnabled = !!agentBuilderContext;
    const isGroupAgentBuilderEnabled = !!groupAgentBuilderContext;
    const isAgentGroupEnabled = agentGroup?.agentMap && Object.keys(agentGroup.agentMap).length > 0;
    const isGroupContextEnabled =
      isAgentGroupEnabled || !!agentGroup?.currentAgentId || !!agentGroup?.members;
    const isUserMemoryEnabled = userMemory?.enabled && userMemory?.memories;

    return [
      // 1. History truncation (MUST be first, before any message injection)
      new HistoryTruncateProcessor({
        enableHistoryCount,
        historyCount,
      }),

      // --------- System role injection providers ---------

      // 2. System role injection (agent's system role)
      new SystemRoleInjector({ systemRole }),

      // 2.5. Group context injection (agent identity and group info for multi-agent chat)
      new GroupContextInjector({
        currentAgentId: agentGroup?.currentAgentId,
        currentAgentName: agentGroup?.currentAgentName,
        currentAgentRole: agentGroup?.currentAgentRole,
        enabled: isGroupContextEnabled,
        groupTitle: agentGroup?.groupTitle,
        members: agentGroup?.members,
        systemPrompt: agentGroup?.systemPrompt,
      }),

      // 3. Knowledge injection (full content for agent files + metadata for knowledge bases)
      new KnowledgeInjector({
        fileContents: knowledge?.fileContents,
        knowledgeBases: knowledge?.knowledgeBases,
      }),

      // 4. Agent Builder context injection (current agent config/meta for editing)
      new AgentBuilderContextInjector({
        enabled: isAgentBuilderEnabled,
        agentContext: agentBuilderContext,
      }),

      // 4.5. Group Agent Builder context injection (current group config/members for editing)
      new GroupAgentBuilderContextInjector({
        enabled: isGroupAgentBuilderEnabled,
        groupContext: groupAgentBuilderContext,
      }),

      // 5. Tool system role injection (conditionally added)
      ...(toolsConfig?.tools && toolsConfig.tools.length > 0
        ? [
            new ToolSystemRoleProvider({
              getToolSystemRoles: toolsConfig.getToolSystemRoles || (() => undefined),
              isCanUseFC: capabilities?.isCanUseFC || (() => true),
              model,
              provider,
              tools: toolsConfig.tools,
            }),
          ]
        : []),

      // 6. History summary injection
      new HistorySummaryProvider({
        formatHistorySummary,
        historySummary,
      }),

      // 7. User memory injection (conditionally added)
      ...(isUserMemoryEnabled
        ? [
            new UserMemoryInjector({
              fetchedAt: userMemory.fetchedAt,
              memories: userMemory.memories,
            }),
          ]
        : []),

      // 9. Input template processing
      new InputTemplateProcessor({ inputTemplate }),

      // 10. Placeholder variables processing
      new PlaceholderVariablesProcessor({
        variableGenerators: variableGenerators || {},
      }),

      // 11. AgentCouncil message flatten (convert role=agentCouncil to standard assistant + tool messages)
      new AgentCouncilFlattenProcessor(),

      // 12. Group message flatten (convert role=assistantGroup to standard assistant + tool messages)
      new GroupMessageFlattenProcessor(),

      // 12.5. Supervisor role restore (convert role=supervisor back to role=assistant for model)
      new SupervisorRoleRestoreProcessor(),

      // 13. Group message sender identity injection (for multi-agent chat)
      ...(isAgentGroupEnabled
        ? [
            new GroupMessageSenderProcessor({
              agentMap: agentGroup.agentMap!,
            }),
          ]
        : []),

      // 14. Message content processing (image encoding, etc.)
      new MessageContentProcessor({
        fileContext: fileContext || { enabled: true, includeFileUrl: true },
        isCanUseVideo: capabilities?.isCanUseVideo || (() => false),
        isCanUseVision: capabilities?.isCanUseVision || (() => true),
        model,
        provider,
      }),

      // 15. Tool call processing
      new ToolCallProcessor({
        genToolCallingName: this.toolNameResolver.generate.bind(this.toolNameResolver),
        isCanUseFC: capabilities?.isCanUseFC || (() => true),
        model,
        provider,
      }),

      // 16. Tool message reordering
      new ToolMessageReorder(),

      // 17. Message cleanup (final step, keep only necessary fields)
      new MessageCleanupProcessor(),
    ];
  }
}
