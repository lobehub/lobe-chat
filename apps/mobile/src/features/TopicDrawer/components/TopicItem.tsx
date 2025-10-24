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
  topic: ChatTopic;
}

/**
 * TopicItem - Topic列表项组件
 * 参考web端TopicItem实现，适配React Native
 */
const TopicItem = memo<TopicItemProps>(({ topic }) => {
  const { t } = useTranslation(['topic', 'common']);
  const theme = useTheme();

  const activeTopicId = useChatStore((s) => s.activeTopicId);
  const removeTopic = useChatStore((s) => s.removeTopic);
  const setTopicDrawerOpen = useGlobalStore((s) => s.setTopicDrawerOpen);
  const switchTopic = useSwitchTopic();

  const isActive = activeTopicId === topic.id;

  const handlePress = () => {
    // 切换到选中的topic
    switchTopic(topic.id);
    // 关闭抽屉
    setTopicDrawerOpen(false);
  };

  const options: DropdownOptionItem[] = [
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
    </Dropdown>
  );
});

TopicItem.displayName = 'TopicItem';

export default TopicItem;
