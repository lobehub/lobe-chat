import debug from 'debug';

import { BaseProcessor } from '../base/BaseProcessor';
import type { Message, PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:processor:GroupMessageSenderProcessor');

const ASSISTANT_CONTEXT_START = '<!-- SYSTEM CONTEXT (NOT PART OF AI RESPONSE) -->';
const ASSISTANT_CONTEXT_END = '<!-- END SYSTEM CONTEXT -->';

/**
 * Agent info for message sender identification
 */
export interface AgentInfo {
  name: string;
  role: 'supervisor' | 'participant';
}

/**
 * Configuration for GroupMessageSenderProcessor
 */
export interface GroupMessageSenderConfig {
  /**
   * Mapping from agentId to agent info
   * Used to look up agent name and role for each message
   */
  agentMap: Record<string, AgentInfo>;
}

/**
 * Group Message Sender Processor
 *
 * Responsible for injecting sender identity information into assistant messages
 * in group chat scenarios. This helps the model understand which agent sent
 * each message in a multi-agent conversation.
 *
 * The processor appends a system context block at the end of each assistant
 * message that has an agentId, containing:
 * - Agent name
 * - Agent role (supervisor or agent)
 * - Agent ID (with instruction not to expose it in responses)
 *
 * @example
 * ```typescript
 * const processor = new GroupMessageSenderProcessor({
 *   agentMap: {
 *     'agt_xxx': { name: 'Weather Expert', role: 'agent' },
 *     'agt_yyy': { name: 'Supervisor', role: 'supervisor' },
 *   }
 * });
 * ```
 */
export class GroupMessageSenderProcessor extends BaseProcessor {
  readonly name = 'GroupMessageSenderProcessor';

  constructor(
    private config: GroupMessageSenderConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    const clonedContext = this.cloneContext(context);

    // Skip if no agentMap provided
    if (!this.config.agentMap || Object.keys(this.config.agentMap).length === 0) {
      log('No agentMap provided, skipping processing');
      return this.markAsExecuted(clonedContext);
    }

    let processedCount = 0;

    clonedContext.messages = clonedContext.messages.map((msg: Message) => {
      // Only process assistant messages with agentId
      if (msg.role === 'assistant' && msg.agentId) {
        const agentInfo = this.config.agentMap[msg.agentId];

        if (agentInfo) {
          // Build the sender context block
          const senderContext = this.buildSenderContext(msg.agentId, agentInfo);

          // Append to message content
          if (typeof msg.content === 'string') {
            processedCount++;
            log(`Injecting sender info for message from agent: ${agentInfo.name} (${agentInfo.role})`);

            return {
              ...msg,
              content: msg.content + senderContext,
            };
          }
          // Handle array content (multimodal messages)
          else if (Array.isArray(msg.content)) {
            const lastTextIndex = msg.content.findLastIndex((part: any) => part.type === 'text');

            if (lastTextIndex !== -1) {
              processedCount++;
              log(
                `Injecting sender info for multimodal message from agent: ${agentInfo.name} (${agentInfo.role})`,
              );

              const newContent = [...msg.content];
              newContent[lastTextIndex] = {
                ...newContent[lastTextIndex],
                text: newContent[lastTextIndex].text + senderContext,
              };

              return {
                ...msg,
                content: newContent,
              };
            }
          }
        }
      }

      return msg;
    });

    // Update metadata
    clonedContext.metadata.groupMessageSenderProcessed = processedCount;

    log(`Group message sender processing completed: ${processedCount} messages processed`);

    return this.markAsExecuted(clonedContext);
  }

  /**
   * Build the sender context block to append to assistant messages
   */
  private buildSenderContext(agentId: string, agentInfo: AgentInfo): string {
    return `
${ASSISTANT_CONTEXT_START}
<message_sender>
<context.instruction>
The agent_id is for internal system use only. NEVER include or reference the agent_id in your responses.
</context.instruction>
name: ${agentInfo.name}
role: ${agentInfo.role}
agent_id: ${agentId}
</message_sender>
${ASSISTANT_CONTEXT_END}`;
  }
}
