import { DiscoverAssistantItem } from '@lobechat/types';
import { ActionIcon, Avatar, Cell, Flexbox, Text, useTheme } from '@lobehub/ui-rn';
import dayjs from 'dayjs';
import { Link, router } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, InteractionManager } from 'react-native';

import { AVATAR_SIZE_MEDIUM } from '@/_const/common';
import { discoverService } from '@/services/discover';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

interface AgentCardProps {
  item: DiscoverAssistantItem;
}

const AgentCardComponent = ({ item }: AgentCardProps) => {
  const theme = useTheme();
  const { t } = useTranslation(['common', 'discover']);
  const { identifier } = item;
  const [isAdding, setIsAdding] = useState(false);
  const createSession = useSessionStore((s) => s.createSession);
  const setDrawerOpen = useGlobalStore((s) => s.setDrawerOpen);

  const handleAddAssistant = async () => {
    setIsAdding(true);

    try {
      const agent = await discoverService.getAssistantDetail({ identifier });
      if (!agent?.config) return;

      const { config } = agent;
      const meta = {
        avatar: agent.avatar,
        backgroundColor: agent.backgroundColor,
        description: agent.description,
        tags: agent.tags,
        title: agent.title,
      };

      // 添加到会话列表
      const session = await createSession(
        {
          config,
          meta,
        },
        false,
      );
      setDrawerOpen(false);
      InteractionManager.runAfterInteractions(() => {
        // 导航到会话页面
        router.replace({
          params: { session: session },
          pathname: '/chat',
        });
      });
    } catch (err) {
      console.error(t('assistant.detail.addFailed', { ns: 'discover' }), err);
      Alert.alert(
        t('status.error', { ns: 'common' }),
        t('assistant.detail.addFailedMessage', { ns: 'discover' }),
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link asChild href={`/discover/assistant/${identifier}`}>
      <Cell
        description={
          <Flexbox flex={1} gap={4}>
            <Text color={theme.colorTextSecondary} ellipsis>
              {item.description}
            </Text>
            {item.author && (
              <Text fontSize={12} type={'secondary'}>
                @{item.author}
                {' · '}
                {dayjs(item.createdAt).format('YYYY-MM-DD')}
              </Text>
            )}
          </Flexbox>
        }
        extra={
          <ActionIcon
            glass
            icon={PlusIcon}
            loading={isAdding}
            onPress={(e) => {
              e.stopPropagation();
              handleAddAssistant();
            }}
            size={'small'}
            variant={'filled'}
          />
        }
        headerProps={{
          align: 'flex-start',
        }}
        icon={
          <Avatar
            avatar={item.avatar || '🤖'}
            backgroundColor={item.backgroundColor}
            size={AVATAR_SIZE_MEDIUM}
          />
        }
        iconSize={AVATAR_SIZE_MEDIUM}
        showArrow={false}
        title={item.title}
        titleProps={{
          weight: 500,
        }}
      />
    </Link>
  );
};

const AgentCard = memo(AgentCardComponent);
AgentCard.displayName = 'AgentCard';

export { AgentCard };

export default AgentCard;
