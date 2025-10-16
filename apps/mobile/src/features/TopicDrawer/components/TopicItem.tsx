import { ChatTopic } from '@lobechat/types';
import { Cell, useTheme } from '@lobehub/ui-rn';
import { MessageSquareText } from 'lucide-react-native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';

interface TopicItemProps {
  topic: ChatTopic;
}

/**
 * TopicItem - Topic列表项组件
 * 参考web端TopicItem实现，适配React Native
 */
const TopicItem = memo<TopicItemProps>(({ topic }) => {
  const { t } = useTranslation('topic');
  const theme = useTheme();

  const activeTopicId = useChatStore((s) => s.activeTopicId);
  const setTopicDrawerOpen = useGlobalStore((s) => s.setTopicDrawerOpen);
  const switchTopic = useSwitchTopic();

  const isActive = activeTopicId === topic.id;

  const handlePress = () => {
    // 切换到选中的topic
    switchTopic(topic.id);
    // 关闭抽屉
    setTopicDrawerOpen(false);
  };

  return (
    <Cell
      active={isActive}
      icon={MessageSquareText}
      iconProps={{
        color: theme.colorTextSecondary,
      }}
      iconSize={16}
      onPress={handlePress}
      showArrow={false}
      title={topic.title || t('defaultTitle')}
      titleProps={{
        fontSize: 14,
      }}
    />
  );
});

TopicItem.displayName = 'TopicItem';

export default TopicItem;
