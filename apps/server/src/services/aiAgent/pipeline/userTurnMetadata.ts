import { RequestTrigger } from '@lobechat/types';

import type { InternalExecAgentParams } from '../types';

export interface UserTurnMetadataInput {
  appContext?: InternalExecAgentParams['appContext'];
  botSender?: InternalExecAgentParams['botSender'];
  externalOrigin?: InternalExecAgentParams['externalOrigin'];
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
  appContext,
  botSender,
  externalOrigin,
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
});
