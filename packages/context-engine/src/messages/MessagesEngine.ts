import type { OpenAIChatMessage } from '@lobechat/types';
import debug from 'debug';

import { ContextEngine } from '../pipeline';
import {
  GroupMessageFlattenProcessor,
  HistoryTruncateProcessor,
  InputTemplateProcessor,
  MessageCleanupProcessor,
  MessageContentProcessor,
  PlaceholderVariablesProcessor,
  ToolCallProcessor,
  ToolMessageReorder,
} from '../processors';
import {
  AgentBuilderContextInjector,
  HistorySummaryProvider,
  KnowledgeInjector,
  PageEditorContextInjector,
  SystemRoleInjector,
  ToolSystemRoleProvider,
  UserMemoryInjector,
} from '../providers';
import { ToolNameResolver } from '../tools';
import type { ContextProcessor } from '../types';
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
      pageEditorContext,
      userMemory,
    } = this.params;

    const isAgentBuilderEnabled = !!agentBuilderContext;
    const isPageEditorEnabled = !!pageEditorContext;
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

      // 3. Knowledge injection (full content for agent files + metadata for knowledge bases)
      new KnowledgeInjector({
        fileContents: knowledge?.fileContents,
        knowledgeBases: knowledge?.knowledgeBases,
      }),

      // 4. Agent Builder context injection (current agent config/meta for editing)
      new AgentBuilderContextInjector({
        agentContext: agentBuilderContext,
        enabled: isAgentBuilderEnabled,
      }),

      // 5. Page Editor context injection (current page/document content for editing)
      new PageEditorContextInjector({
        enabled: isPageEditorEnabled,
        pageContext: pageEditorContext,
      }),

      // 6. Tool system role injection (conditionally added)
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

      // 7. History summary injection
      new HistorySummaryProvider({
        formatHistorySummary,
        historySummary,
      }),

      // 8. User memory injection (conditionally added)
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

      // 11. Group message flatten (convert role=group to standard assistant + tool messages)
      new GroupMessageFlattenProcessor(),

      // 12. Message content processing (image encoding, etc.)
      new MessageContentProcessor({
        fileContext: fileContext || { enabled: true, includeFileUrl: true },
        isCanUseVideo: capabilities?.isCanUseVideo || (() => false),
        isCanUseVision: capabilities?.isCanUseVision || (() => true),
        model,
        provider,
      }),

      // 13. Tool call processing
      new ToolCallProcessor({
        genToolCallingName: this.toolNameResolver.generate.bind(this.toolNameResolver),
        isCanUseFC: capabilities?.isCanUseFC || (() => true),
        model,
        provider,
      }),

      // 14. Tool message reordering
      new ToolMessageReorder(),

      // 15. Message cleanup (final step, keep only necessary fields)
      new MessageCleanupProcessor(),
    ];
  }
}
