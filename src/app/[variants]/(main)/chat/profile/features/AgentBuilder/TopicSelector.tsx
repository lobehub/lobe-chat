import { ActionIcon, Icon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import type { ItemType } from 'antd/es/menu/interface';
import { ChevronDown, MessageSquare, MessageSquarePlus, Star } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    padding-block: 8px;
    padding-inline: 12px;

    border-radius: 8px;

    transition: background-color 0.2s;

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,
  menu: css`
    max-height: 400px;
    overflow-y: auto;
  `,
  title: css`
    overflow: hidden;

    max-width: 200px;

    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

interface TopicSelectorProps {
  agentId: string;
}

const TopicSelector = memo<TopicSelectorProps>(({ agentId }) => {
  const { t } = useTranslation('topic');
  const { styles, theme } = useStyles();

  // Fetch topics for the agent builder
  useChatStore((s) => s.useFetchTopics)(true, { agentId });

  const [activeTopicId, switchTopic, topics] = useChatStore((s) => [
    s.activeTopicId,
    s.switchTopic,
    s.topicDataMap[agentId]?.items,
  ]);

  const activeTopic = useChatStore(topicSelectors.getTopicById(activeTopicId || ''));

  const currentTitle = activeTopic?.title || t('defaultTitle');

  const items = useMemo<ItemType[]>(() => {
    const menuItems: ItemType[] = [
      {
        icon: <Icon icon={MessageSquarePlus} size={'small'} />,
        key: 'new',
        label: t('actions.addNewTopic'),
        onClick: () => switchTopic(),
      },
      { type: 'divider' },
    ];

    if (!topics || topics.length === 0) {
      menuItems.push({
        disabled: true,
        key: 'empty',
        label: (
          <Flexbox style={{ color: theme.colorTextTertiary }}>{t('searchResultEmpty')}</Flexbox>
        ),
      });
      return menuItems;
    }

    // Add topic items
    topics.forEach((topic) => {
      menuItems.push({
        icon: (
          <ActionIcon
            color={topic.favorite ? theme.colorWarning : undefined}
            fill={topic.favorite ? theme.colorWarning : 'transparent'}
            icon={Star}
            size={'small'}
          />
        ),
        key: topic.id,
        label: topic.title,
        onClick: () => switchTopic(topic.id),
      });
    });

    return menuItems;
  }, [topics, t, theme.colorTextTertiary, theme.colorWarning, switchTopic]);

  return (
    <Dropdown
      menu={{
        className: styles.menu,
        items,
        selectedKeys: activeTopicId ? [activeTopicId] : [],
      }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Flexbox align="center" className={styles.container} gap={8} horizontal>
        <Icon icon={MessageSquare} size={'small'} />
        <span className={styles.title}>{currentTitle}</span>
        <Icon icon={ChevronDown} size={'small'} />
      </Flexbox>
    </Dropdown>
  );
});

TopicSelector.displayName = 'TopicSelector';

export default TopicSelector;
