import { Avatar, Block, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import Time from '@/app/[variants]/(main)/home/features/components/Time';
import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { DEFAULT_AVATAR } from '@/const/meta';
import { RecentTopic } from '@/types/topic';

const ReactTopicItem = memo<RecentTopic>(({ title, updatedAt, agent }) => {
  const theme = useTheme();

  return (
    <Block
      clickable
      flex={'none'}
      height={RECENT_BLOCK_SIZE.TOPIC.HEIGHT}
      style={{
        borderRadius: theme.borderRadiusLG,
        overflow: 'hidden',
      }}
      variant={'outlined'}
      width={RECENT_BLOCK_SIZE.TOPIC.WIDTH}
    >
      <Center
        flex={'none'}
        height={44}
        style={{
          background: theme.colorFillTertiary,
          overflow: 'hidden',
        }}
      >
        <Avatar
          avatar={agent?.avatar || DEFAULT_AVATAR}
          background={agent?.backgroundColor || undefined}
          shape={'square'}
          size={200}
          style={{
            filter: 'blur(100px)',
          }}
          title={agent?.title || undefined}
        />
      </Center>
      <Flexbox flex={1} gap={6} justify={'space-between'} padding={12}>
        <Flexbox
          gap={6}
          style={{
            marginTop: -32,
          }}
        >
          <Avatar
            avatar={agent?.avatar || DEFAULT_AVATAR}
            background={agent?.backgroundColor || undefined}
            shape={'square'}
            size={36}
          />
          <Text ellipsis={{ rows: 2 }} style={{ lineHeight: 1.4 }} weight={500}>
            {title}
          </Text>
        </Flexbox>
        <Time date={updatedAt} />
      </Flexbox>
    </Block>
  );
});

export default ReactTopicItem;
