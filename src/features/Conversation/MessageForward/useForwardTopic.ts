import { AGENT_CHAT_TOPIC_URL } from '@lobechat/const';
import { toast } from '@lobehub/ui/base-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useChatStore } from '@/store/chat';
import type { ForwardTarget } from '@/store/chat/slices/forward/action';

interface ForwardTopicSource {
  agentId: string;
  onSuccess?: () => void | Promise<void>;
  topicId: string;
}

export const useForwardTopic = ({ agentId, onSuccess, topicId }: ForwardTopicSource) => {
  const { t } = useTranslation('chat');

  const navigate = useWorkspaceAwareNavigate();
  const forwardTopic = useChatStore((s) => s.forwardTopic);
  const clearPortalStack = useChatStore((s) => s.clearPortalStack);

  return useCallback(
    (targets: ForwardTarget[], note?: string) => {
      if (targets.length === 0) return;

      const primaryTarget = targets[0];
      let acceptance: Promise<void> | undefined;
      void forwardTopic({
        header: t('messageForward.topic.header'),
        note,
        onTopicCreated: async (target, createdTopicId) => {
          // A persisted target owns the handoff; do not wait for its run to finish.
          acceptance ??= Promise.resolve()
            .then(onSuccess)
            .catch((error) => {
              console.error('[useForwardTopic] Handoff follow-up failed:', error);
              toast.error(t('messageForward.failed'));
            });
          await acceptance;
          if (target.id !== primaryTarget.id) return;
          clearPortalStack();
          navigate(AGENT_CHAT_TOPIC_URL(target.id, createdTopicId));
        },
        roleLabel: (role) =>
          role === 'user' ? t('messageForward.role.user') : t('messageForward.role.assistant'),
        sourceAgentId: agentId,
        targets,
        topicId,
      })
        .then((result) => {
          if (result.succeeded.length > 0) {
            toast.success(
              targets.length === 1
                ? t('messageForward.success', { title: primaryTarget.title || '' })
                : t('messageForward.successMulti', { count: result.succeeded.length }),
            );
          }
          if (result.failed.length > 0) toast.error(t('messageForward.failed'));
        })
        .catch((error) => {
          console.error('[useForwardTopic] Forwarding failed:', error);
          toast.error(t('messageForward.topic.loadFailed'));
        });
    },
    [agentId, clearPortalStack, forwardTopic, navigate, onSuccess, t, topicId],
  );
};
