import { ActionIcon, Tag } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import type { ItemType } from 'antd/es/menu/interface';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Clock3Icon, PlusIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import NavHeader from '@/features/NavHeader';
import { useChatStore } from '@/store/chat';

dayjs.extend(relativeTime);

const useStyles = createStyles(({ css, token }) => ({
  time: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  title: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

interface TopicSelectorProps {
  agentId: string;
}

const TopicSelector = memo<TopicSelectorProps>(({ agentId }) => {
  const { t } = useTranslation('topic');
  const { styles } = useStyles();

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
      (topics || []).map((topic) => {
        const displayTime =
          dayjs().diff(dayjs(topic.updatedAt), 'd') < 7
            ? dayjs(topic.updatedAt).fromNow()
            : dayjs(topic.updatedAt).format('YYYY-MM-DD');

        return {
          key: topic.id,
          label: (
            <Flexbox gap={4} horizontal justify="space-between" width="100%">
              <span className={styles.title}>{topic.title}</span>
              <span className={styles.time}>{displayTime}</span>
            </Flexbox>
          ),
          onClick: () => switchTopic(topic.id),
        };
      }),
    [topics, switchTopic, styles],
  );

  return (
    <NavHeader
      left={activeTopic?.title ? <Tag>{activeTopic.title}</Tag> : undefined}
      right={
        <>
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
              style: { maxHeight: 400, overflowY: 'auto' },
            }}
            overlayStyle={{ minWidth: 280 }}
            placement="bottomRight"
            trigger={['click']}
          >
            <ActionIcon disabled={!topics || topics.length === 0} icon={Clock3Icon} />
          </Dropdown>
        </>
      }
      showTogglePanelButton={false}
    />
  );
});

TopicSelector.displayName = 'TopicSelector';

export default TopicSelector;
