import { AGENT_CHAT_TOPIC_URL } from '@lobechat/const';
import type { ChatTopicStatus } from '@lobechat/types';
import { ActionIcon, DropdownMenu, Icon } from '@lobehub/ui';
import { MessageSquareShare, MoreHorizontalIcon } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SMALL_SIZE } from '@/const/layoutTokens';
import { useDropdownMenu } from '@/features/PageEditor/Copilot/TopicSelector/useDropdownMenu';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';

const noop = () => {};

interface TopicActionsProps {
  agentId: string;
  fav?: boolean;
  status?: ChatTopicStatus | null;
  topicId: string;
  topicTitle: string;
}

/** The standard topic "…" menu, led by a jump to the topic's own conversation page. */
const TopicActions = memo<TopicActionsProps>(({ agentId, fav, status, topicId, topicTitle }) => {
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

  const items = useCallback(
    () => [
      {
        icon: <Icon icon={MessageSquareShare} />,
        key: 'openTopic',
        label: t('goalChat.openTopic'),
        onClick: () => navigate(AGENT_CHAT_TOPIC_URL(agentId, topicId)),
      },
      { type: 'divider' as const },
      ...topicMenu(),
    ],
    [agentId, navigate, t, topicId, topicMenu],
  );

  return (
    <DropdownMenu items={items}>
      <ActionIcon icon={MoreHorizontalIcon} size={DESKTOP_HEADER_ICON_SMALL_SIZE} />
    </DropdownMenu>
  );
});

TopicActions.displayName = 'GoalChatTopicActions';

export default TopicActions;
