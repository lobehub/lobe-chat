import type { AgentSenderMetadata, ContextSelection, PageSelection } from '@lobechat/types';
import { RequestTrigger } from '@lobechat/types';

import type { InternalExecAgentParams } from '../types';

export interface UserTurnMetadataInput {
  agentSender?: AgentSenderMetadata;
  appContext?: InternalExecAgentParams['appContext'];
  botSender?: InternalExecAgentParams['botSender'];
  contextSelections?: ContextSelection[];
  externalOrigin?: InternalExecAgentParams['externalOrigin'];
  pageSelections?: PageSelection[];
  selectedSkillIds?: string[];
  steer?: boolean;
  trigger?: string;
}

/**
 * Metadata persisted on the user message a send creates, derived from the
 * request. Each field is present only when the request carries it, so an
 * ordinary chat turn stores no more than `trigger`.
 */
export const buildUserTurnMetadata = ({
  agentSender,
  appContext,
  botSender,
  contextSelections,
  externalOrigin,
  pageSelections,
  selectedSkillIds,
  steer,
  trigger,
}: UserTurnMetadataInput) => ({
  ...(trigger && Object.values(RequestTrigger).includes(trigger as RequestTrigger)
    ? { trigger: trigger as RequestTrigger }
    : undefined),
  ...(appContext?.conversationAgentId && appContext.scope === 'sub_agent'
    ? { agentDispatch: { kind: 'callAgent' as const, visibility: 'internal' as const } }
    : undefined),
  // An agent → agent turn (a sibling agent calling `lh agent run`). The row is
  // persisted in THIS topic under the human owner, so keep the sending agent
  // alongside — the UI shows it as the author and links back to its topic.
  ...(agentSender ? { agentSender } : undefined),
  // Bot-channel turns are inserted under the OWNER's userId; keep the real
  // platform author alongside so the UI can attribute the bubble correctly.
  ...(botSender ? { botSender } : undefined),
  // A provider event that injected this turn keeps its source on the row.
  ...(externalOrigin ? { externalOrigin } : undefined),
  // A follow-up queued behind a running turn renders as that turn's
  // continuation; the client's optimistic row is replaced by this one.
  ...(steer ? { steer: true as const } : undefined),
  // Later turns read the selection back from history, so the skills stay
  // injected for the rest of the topic (see `collectSelectedSkillIds`).
  ...(selectedSkillIds?.length ? { selectedSkillIds: [...new Set(selectedSkillIds)] } : undefined),
  // Content attached from the conversation, a page or code. The bubble renders
  // it as a quote and the context engine injects it for this and later turns.
  ...(contextSelections?.length ? { contextSelections } : undefined),
  ...(pageSelections?.length ? { pageSelections } : undefined),
});
