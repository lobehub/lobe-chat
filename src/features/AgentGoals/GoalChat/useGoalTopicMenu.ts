import { AGENT_CHAT_TOPIC_URL } from '@lobechat/const';
import type { ChatTopicStatus } from '@lobechat/types';
import type { DropdownItem } from '@lobehub/ui';
import { MessageSquareShare } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useDropdownMenu } from '@/features/PageEditor/Copilot/TopicSelector/useDropdownMenu';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';

const noop = () => {};

export interface GoalTopicMenuParams {
  agentId: string;
  fav?: boolean;
  status?: ChatTopicStatus | null;
  topicId: string;
  topicTitle: string;
}

/** The standard topic menu, led by a jump to the topic's own conversation page. */
export const useGoalTopicMenu = ({
  agentId,
  fav,
  status,
  topicId,
  topicTitle,
}: GoalTopicMenuParams): (() => DropdownItem[]) => {
  const { t } = useTranslation('chat');
  const navigate = useWorkspaceAwareNavigate();

  const topicMenu = useDropdownMenu({
    agentId,
    fav,
    onClose: noop,
    status,
    topicId,
    topicTitle,
  });

  return useCallback(
    () => [
      {
        icon: MessageSquareShare,
        key: 'openTopic',
        label: t('goalChat.openTopic'),
        onClick: () => navigate(AGENT_CHAT_TOPIC_URL(agentId, topicId)),
      },
      { type: 'divider' as const },
      ...topicMenu(),
    ],
    [agentId, navigate, t, topicId, topicMenu],
  );
};
