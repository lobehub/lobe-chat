import { ActionIcon, Tag } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import type { ItemType } from 'antd/es/menu/interface';
import { ArrowRightFromLineIcon, Clock3Icon, PlusIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import NavHeader from '@/features/NavHeader';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';

const useStyles = createStyles(({ css }) => ({
  fadeContainer: css`
    display: flex;
    gap: 4px;
    align-items: center;
    transition: opacity 0.2s ease-in-out;
  `,
  fadeIn: css`
    opacity: 1;
  `,
  fadeOut: css`
    pointer-events: none;
    opacity: 0;
  `,
  topicTitle: css`
    overflow: hidden;
    max-width: 200px;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

interface CopilotToolbarProps {
  agentId: string;
  isHovered: boolean;
}

const CopilotToolbar = memo<CopilotToolbarProps>(({ agentId, isHovered }) => {
  const { t } = useTranslation('topic');
  const { styles, cx } = useStyles();

  // Fetch topics for the agent builder
  useChatStore((s) => s.useFetchTopics)(true, { agentId });

  const [activeTopicId, switchTopic, topics] = useChatStore((s) => [
    s.activeTopicId,
    s.switchTopic,
    s.topicDataMap[agentId]?.items,
  ]);

  // Find active topic from the agent's topics list directly
  const activeTopic = useMemo(
    () => topics?.find((topic) => topic.id === activeTopicId),
    [topics, activeTopicId],
  );

  const items = useMemo<ItemType[]>(
    () =>
      (topics || []).map((topic) => ({
        key: topic.id,
        label: topic.title,
        onClick: () => switchTopic(topic.id),
      })),
    [topics, t, switchTopic],
  );

  const [toggleRightPanel] = useGlobalStore((s) => [s.toggleRightPanel]);

  return (
    <NavHeader
      left={
        activeTopic?.title ? (
          <Tag className={styles.topicTitle} title={activeTopic.title}>
            {activeTopic.title}
          </Tag>
        ) : undefined
      }
      right={
        <>
          <div className={cx(styles.fadeContainer, isHovered ? styles.fadeIn : styles.fadeOut)}>
            <ActionIcon
              icon={PlusIcon}
              onClick={() => switchTopic()}
              size={DESKTOP_HEADER_ICON_SIZE}
              title={t('actions.addNewTopic')}
            />
            <Dropdown
              disabled={!topics || topics.length === 0}
              menu={{
                items,
                selectedKeys: activeTopicId ? [activeTopicId] : [],
              }}
              overlayStyle={{
                maxHeight: 600,
                minWidth: 200,
                overflowY: 'auto',
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <ActionIcon disabled={!topics || topics.length === 0} icon={Clock3Icon} />
            </Dropdown>
          </div>
          <ActionIcon
            icon={ArrowRightFromLineIcon}
            onClick={() => toggleRightPanel()}
            size={DESKTOP_HEADER_ICON_SIZE}
          />
        </>
      }
      showTogglePanelButton={false}
    />
  );
});

CopilotToolbar.displayName = 'TopicSelector';

export default CopilotToolbar;
