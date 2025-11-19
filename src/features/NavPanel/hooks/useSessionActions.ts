import { App } from 'antd';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useActionSWR } from '@/libs/swr';
import { useSessionStore } from '@/store/session';
import type { LobeAgentSession } from '@/types/session';

interface CreateAgentOptions {
  groupId?: string;
  isPinned?: boolean;
  onSuccess?: () => void;
}

/**
 * Unified hook for all session/agent creation operations
 * Consolidates session creation logic with proper loading states and messages
 */
export const useSessionActions = () => {
  const { t } = useTranslation('chat');
  const { message } = App.useApp();
  const [createSession] = useSessionStore((s) => [s.createSession]);
  const [isCreating, setIsCreating] = useState(false);

  // SWR-based agent creation for simple cases
  const { mutate: mutateAgent, isValidating: isValidatingAgent } = useActionSWR(
    'session.createSession',
    (data?: Partial<LobeAgentSession>) => createSession(data),
  );

  /**
   * Create a new agent/session
   * - Without options: Simple agent creation with SWR (default behavior)
   * - With groupId/isPinned: Direct creation with custom parameters and feedback
   */
  const createAgent = useCallback(
    async (options?: CreateAgentOptions) => {
      // Simple creation without group/pin options - use SWR
      if (!options?.groupId && !options?.isPinned) {
        await mutateAgent();
        options?.onSuccess?.();
        return;
      }

      // Advanced creation with group/pin options
      const key = 'createNewAgent';
      message.loading({ content: t('sessionGroup.creatingAgent'), duration: 0, key });
      setIsCreating(true);

      try {
        await createSession({
          group: options.groupId,
          pinned: options.isPinned,
        });

        message.destroy(key);
        message.success({ content: t('sessionGroup.createAgentSuccess') });
        options?.onSuccess?.();
      } catch (error) {
        message.destroy(key);
        message.error({ content: t('sessionGroup.createGroupFailed') });
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [createSession, mutateAgent, message, t],
  );

  return {
    createAgent,
    isCreating,
    // Combined loading state
    isLoading: isValidatingAgent || isCreating,

    isValidatingAgent,
  };
};
