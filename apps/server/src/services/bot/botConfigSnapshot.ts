import { createHash } from 'node:crypto';

import type { DecryptedBotProvider } from '@/database/models/agentBotProvider';

/** Ignore activity timestamps; include every field captured by the runtime. */
export const botConfigSnapshot = (provider: DecryptedBotProvider): string =>
  createHash('sha256')
    .update(
      JSON.stringify({
        agentId: provider.agentId,
        applicationId: provider.applicationId,
        credentials: provider.credentials,
        id: provider.id,
        platform: provider.platform,
        settings: provider.settings,
        userId: provider.userId,
        workspaceId: provider.workspaceId,
      }),
    )
    .digest('hex');
