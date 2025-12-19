import { Avatar, Block, GroupAvatar, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo, useMemo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import Time from '@/app/[variants]/(main)/home/features/components/Time';
import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { DEFAULT_AVATAR } from '@/const/meta';
import { RecentTopic } from '@/types/topic';

const ReactTopicItem = memo<RecentTopic>(({ title, updatedAt, agent, group, type }) => {
  const theme = useTheme();

  const isGroup = type === 'group';

  // For group topics, get the first member's background for blur effect
  const blurBackground = isGroup ? group?.members?.[0]?.backgroundColor : agent?.backgroundColor;

  // Build group avatars for GroupAvatar component
  const groupAvatars = useMemo(() => {
    if (!isGroup || !group?.members) return [];
    return group.members.map((member) => ({
      avatar: member.avatar || DEFAULT_AVATAR,
      background: member.backgroundColor || undefined,
      style: { borderRadius: 3 },
    }));
  }, [isGroup, group?.members]);

  // Display title - group title or agent title
  const displayTitle = isGroup ? group?.title : agent?.title;

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
          avatar={
            isGroup
              ? group?.members?.[0]?.avatar || DEFAULT_AVATAR
              : agent?.avatar || DEFAULT_AVATAR
          }
          background={blurBackground || undefined}
          emojiScaleWithBackground
          shape={'square'}
          size={200}
          style={{
            filter: 'blur(100px)',
          }}
        />
      </Center>
      <Flexbox flex={1} gap={6} justify={'space-between'} padding={12}>
        <Flexbox
          gap={6}
          style={{
            marginTop: -28,
          }}
        >
          {isGroup ? (
            <GroupAvatar
              avatarShape={'square'}
              avatars={groupAvatars}
              cornerShape={'square'}
              size={30}
              style={{
                background: theme.colorBgLayout,
              }}
            />
          ) : (
            <Avatar
              avatar={agent?.avatar || DEFAULT_AVATAR}
              background={agent?.backgroundColor || undefined}
              emojiScaleWithBackground
              shape={'square'}
              size={30}
              title={agent?.title || undefined}
            />
          )}
          <Text ellipsis={{ rows: 2 }} style={{ lineHeight: 1.4 }} weight={500}>
            {title}
          </Text>
        </Flexbox>
        <Flexbox align={'center'} gap={8} horizontal>
          <Time date={updatedAt} />
          <Text ellipsis fontSize={12} type={'secondary'}>
            {displayTitle}
          </Text>
        </Flexbox>
      </Flexbox>
    </Block>
  );
});

export default ReactTopicItem;
