'use client';

import { memo } from 'react';
import { Navigate, useParams } from 'react-router';

import { buildAgentShareChatPath, buildAgentShareProfilePath } from './visitorPath';

/**
 * Keeps already-shared deep links alive after the profile/chat split.
 *
 * Before the split the second segment WAS the topic id (`/a/:slug/:topicId`),
 * so every link handed out until now points at a path that no longer resolves
 * to a conversation. This route catches those and forwards to the same topic
 * under `/chat`, replacing the entry so Back does not bounce.
 */
const LegacyTopicRedirect = memo(() => {
  const { legacyTopicId, slugOrId = '' } = useParams<{
    legacyTopicId: string;
    slugOrId: string;
  }>();

  return (
    <Navigate
      replace
      to={
        legacyTopicId
          ? buildAgentShareChatPath(slugOrId, legacyTopicId)
          : buildAgentShareProfilePath(slugOrId)
      }
    />
  );
});

LegacyTopicRedirect.displayName = 'AgentShareLegacyTopicRedirect';

export default LegacyTopicRedirect;
