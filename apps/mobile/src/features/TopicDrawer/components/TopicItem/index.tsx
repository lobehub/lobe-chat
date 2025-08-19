import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { ChatTopic } from '@/types/topic';

import { useStyles } from './style';

interface TopicItemProps {
  topic: ChatTopic;
}

/**
 * TopicItem - Topic列表项组件
 * 参考web端TopicItem实现，适配React Native
 */
const TopicItem = memo<TopicItemProps>(({ topic }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('topic');

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
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[styles.container, isActive && styles.activeContainer]}
    >
      <View style={styles.content}>
        <Text
          ellipsizeMode="tail"
          numberOfLines={2}
          style={[styles.title, isActive && styles.activeTitle]}
        >
          {topic.title || t('defaultTitle')}
        </Text>

        {/* TODO: 后续可以添加更多信息，如时间、消息数等 */}
      </View>
    </TouchableOpacity>
  );
});

TopicItem.displayName = 'TopicItem';

export default TopicItem;
