import type { UIChatMessage } from '@lobechat/types';
import debug from 'debug';
import { isAutoRoutingProvider } from 'model-bank/autoRouting';

import { aiModelService } from '@/services/aiModel';
import { messageService } from '@/services/message';
import { getAgentStoreState } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import type { ChatStoreState } from '@/store/chat/initialState';
import { topicSelectors } from '@/store/chat/selectors';
import type { ChatStore } from '@/store/chat/store';

const log = debug('lobe-store:auto-model-routing');

/**
 * Client-runtime counterpart of the server turn-setup routing: when the run's
 * model is a Lite / Pro / Ultra tier, ask the server for the real model of this
 * turn and force it as the run's model override. Returns the explicit override
 * (or `undefined`) for an ordinary model and throws when a tier cannot be routed.
 */
export const resolveClientAutoRoute = async (
  params: {
    agentId: string;
    context: { topicId?: string | null };
    /** A sub-agent shares its parent's topic; it must not move the parent's routing memory. */
    isSubAgent?: boolean;
    messages: UIChatMessage[];
    /** The run's forced model; a tier here is routed like the agent's own. */
    modelOverride?: { model: string; provider: string };
    operationId?: string;
    parentMessageId: string;
    parentMessageType: 'user' | 'assistant' | 'tool';
    /** Set when the assistant row was pre-created with the user turn; it gets the routed model. */
    skipCreateFirstMessage?: boolean;
  },
  chatState: Pick<ChatStore, 'internal_dispatchMessage'> & ChatStoreState,
): Promise<{ model: string; provider: string } | undefined> => {
  const { agentId, messages, operationId, parentMessageId } = params;
  const topicId = params.context.topicId;
  const assistantMessageId = params.skipCreateFirstMessage ? parentMessageId : undefined;
  const agentState = getAgentStoreState();
  const { modelOverride } = params;
  if (modelOverride && !isAutoRoutingProvider(modelOverride.provider)) return modelOverride;

  const pinned = topicId ? topicSelectors.getTopicModelById(topicId)(chatState) : undefined;
  const model =
    modelOverride?.model ??
    pinned?.model ??
    agentByIdSelectors.getAgentModelById(agentId)(agentState);
  const provider =
    modelOverride?.provider ??
    pinned?.provider ??
    agentByIdSelectors.getAgentModelProviderById(agentId)(agentState);
  if (!isAutoRoutingProvider(provider)) return;

  const lastUser = messages.findLast((message) => message.role === 'user');
  try {
    const routed = await aiModelService.resolveAutoRoute({
      attachments: {
        audios: lastUser?.audioList?.length,
        files: lastUser?.fileList?.length,
        images: lastUser?.imageList?.length,
        videos: lastUser?.videoList?.length,
      },
      // Resuming after a tool call: keep the model the turn started on.
      continuation: params.parentMessageType === 'tool',
      model,
      prompt: lastUser?.content ?? '',
      provider,
      topicId: params.isSubAgent ? undefined : (topicId ?? undefined),
    });
    if (!routed) throw new Error('Auto routing found no model for this turn');

    // Awaited: the run's own finalize write merges metadata too, and two
    // concurrent read-merge-writes would drop this stamp.
    if (assistantMessageId) {
      const patch = {
        metadata: { autoRouting: routed.metadata },
        model: routed.model,
        provider: routed.provider,
      };
      // Local store first, so the tier tag shows without a reload.
      chatState.internal_dispatchMessage(
        {
          id: assistantMessageId,
          type: 'updateMessage',
          value: { model: patch.model, provider: patch.provider },
        },
        { operationId },
      );
      chatState.internal_dispatchMessage(
        { id: assistantMessageId, type: 'updateMessageMetadata', value: patch.metadata },
        { operationId },
      );
      await messageService
        .updateMessage(assistantMessageId, patch)
        .catch((error) => log('failed to stamp routed model: %O', error));
    }
    return { model: routed.model, provider: routed.provider };
  } catch (error) {
    // Running on the virtual model would fail with an opaque provider error;
    // surface the routing failure itself instead.
    log('auto routing failed: %O', error);
    throw error;
  }
};
