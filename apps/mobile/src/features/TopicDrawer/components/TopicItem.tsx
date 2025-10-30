import { ChatTopic } from '@lobechat/types';
import { Cell, useTheme } from '@lobehub/ui-rn';
import { Star } from 'lucide-react-native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, InteractionManager } from 'react-native';

import { Toast } from '@/components';
import Dropdown from '@/components/Dropdown';
import type { DropdownOptionItem } from '@/components/Dropdown';
import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { loading } from '@/libs/loading';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';

interface TopicItemProps {
  /**
   * 自定义点击事件，如果提供则覆盖默认行为
   */
  onPress?: () => void;
  topic: ChatTopic;
}

/**
 * TopicItem - Topic列表项组件
 * 参考web端TopicItem实现，适配React Native
 */
const TopicItem = memo<TopicItemProps>(({ topic, onPress: customOnPress }) => {
  const { t } = useTranslation(['topic', 'common']);
  const theme = useTheme();

  const activeTopicId = useChatStore((s) => s.activeTopicId);
  const removeTopic = useChatStore((s) => s.removeTopic);
  const favoriteTopic = useChatStore((s) => s.favoriteTopic);
  const setTopicDrawerOpen = useGlobalStore((s) => s.setTopicDrawerOpen);
  const switchTopic = useSwitchTopic();

  const isActive = activeTopicId === topic.id;

  const handlePress = () => {
    if (customOnPress) {
      // 使用自定义点击行为
      customOnPress();
    } else {
      // 默认行为：切换到选中的topic并关闭抽屉
      switchTopic(topic.id);
      setTopicDrawerOpen(false);
    }
  };

  const options: DropdownOptionItem[] = [
    {
      icon: {
        name: topic.favorite ? 'star.fill' : 'star',
        pointSize: 18,
      },
      key: topic.favorite ? 'unfavorite' : 'favorite',
      onSelect: () => {
        favoriteTopic(topic.id, !topic.favorite);
      },
      title: topic.favorite
        ? t('actions.unfavorite', { ns: 'topic' })
        : t('actions.favorite', { ns: 'topic' }),
    },
    {
      destructive: true,
      icon: {
        name: 'trash',
        pointSize: 18,
      },
      key: 'delete',
      onSelect: () => {
        Alert.alert(t('confirmRemoveTopicItemAlert', { ns: 'topic' }), '', [
          {
            style: 'cancel',
            text: t('actions.cancel', { ns: 'common' }),
          },
          {
            onPress: () => {
              const { done } = loading.start();
              removeTopic(topic.id).then(() => {
                Toast.success(t('status.success', { ns: 'common' }));
                InteractionManager.runAfterInteractions(() => {
                  setTopicDrawerOpen(false);
                  done();
                });
              });
            },
            style: 'destructive',
            text: t('actions.confirm', { ns: 'common' }),
          },
        ]);
      },
      title: t('actions.delete', { ns: 'common' }),
    },
  ];

  return (
    <Dropdown options={options}>
      <Cell
        active={isActive}
        icon={Star}
        iconProps={{
          color: topic.favorite ? theme.gold : theme.colorTextDescription,
          fill: topic.favorite ? theme.gold : undefined,
        }}
        iconSize={16}
        onPress={handlePress}
        showArrow={false}
        title={topic.title || t('defaultTitle')}
        titleProps={{
          fontSize: 14,
          style: {
            width: '95%',
          },
        }}
      />
    </Dropdown>
  );
});

TopicItem.displayName = 'TopicItem';

export default TopicItem;
