import React, { memo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MessageSquareDashed } from 'lucide-react-native';

import { useFetchTopics } from '@/hooks/useFetchTopics';
import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { useGlobalStore } from '@/store/global';
import { topicSelectors } from '@/store/chat/selectors';
import { useThemeToken } from '@/theme';
import TopicItem from '../TopicItem';
import { useStyles } from './style';

/**
 * TopicList - Topic列表组件
 * 展示当前会话下的所有话题
 */
const TopicList = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('topic');
  const token = useThemeToken();

  // 获取当前会话的topics - 参考web端实现
  useFetchTopics();

  const topics = useChatStore((s) => topicSelectors.currentTopics(s));
  const activeTopicId = useChatStore((s) => s.activeTopicId);
  const activeId = useSessionStore((s) => s.activeId);
  const setTopicDrawerOpen = useGlobalStore((s) => s.setTopicDrawerOpen);
  const switchTopic = useSwitchTopic();

  // 如果是inbox且没有topics，显示提示信息
  if (activeId === 'inbox' && topics?.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('title')}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('empty')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('title')}</Text>
      </View>

      {/* Topic列表 */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews={true}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* 默认话题 - 始终显示在第一位，参考web端实现 */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            switchTopic(); // 切换到默认topic (null)
            setTopicDrawerOpen(false);
          }}
          style={[styles.defaultTopicContainer, !activeTopicId && styles.activeDefaultTopic]}
        >
          <View style={styles.defaultTopicIcon}>
            <MessageSquareDashed
              color={!activeTopicId ? token.colorText : token.colorTextSecondary}
              size={16}
            />
          </View>
          <View style={styles.defaultTopicContent}>
            <Text
              style={[styles.defaultTopicTitle, !activeTopicId && styles.activeDefaultTopicTitle]}
            >
              {t('defaultTitle')}
            </Text>
          </View>
          <View style={styles.tempBadgeContainer}>
            <Text style={styles.tempBadge}>{t('temp')}</Text>
          </View>
        </TouchableOpacity>

        {/* 实际的topic列表项 */}
        {topics?.map((topic) => (
          <TopicItem key={topic.id} topic={topic} />
        ))}
      </ScrollView>
    </View>
  );
});

TopicList.displayName = 'TopicList';

export default TopicList;
