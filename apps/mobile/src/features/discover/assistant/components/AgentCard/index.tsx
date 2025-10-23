import { DiscoverAssistantItem } from '@lobechat/types';
import { ActionIcon, Avatar, Cell, Flexbox, Text, useTheme } from '@lobehub/ui-rn';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { memo, useCallback } from 'react';

import { AVATAR_SIZE_MEDIUM } from '@/_const/common';

interface AgentCardProps {
  item: DiscoverAssistantItem;
}

const AgentCardComponent = ({ item }: AgentCardProps) => {
  const theme = useTheme();

  const { identifier } = item;

  const handlePress = useCallback(() => {
    router.push({
      params: { slugs: [identifier] },
      pathname: '/discover/assistant/[...slugs]',
    });
  }, [identifier]);

  return (
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
      extra={<ActionIcon glass icon={PlusIcon} size={'small'} variant={'filled'} />}
      headerProps={{
        align: 'flex-start',
      }}
      icon={<Avatar avatar={item.avatar || '🤖'} size={AVATAR_SIZE_MEDIUM} />}
      iconSize={AVATAR_SIZE_MEDIUM}
      onPress={handlePress}
      showArrow={false}
      title={item.title}
    />
  );
};

const AgentCard = memo(AgentCardComponent);
AgentCard.displayName = 'AgentCard';

export { AgentCard };

export default AgentCard;
