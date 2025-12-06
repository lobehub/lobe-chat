import { Avatar, Block, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { DEFAULT_AVATAR } from '@/const/meta';
import { DiscoverAssistantItem } from '@/types/discover';

const CommunityAgentItem = memo<DiscoverAssistantItem>(
  ({ title, avatar, backgroundColor, author, description }) => {
    const theme = useTheme();

    return (
      <Block
        clickable
        flex={'none'}
        height={RECENT_BLOCK_SIZE.AGENT.HEIGHT}
        justify={'space-between'}
        style={{
          backgroundColor: theme.colorFillQuaternary,
          borderRadius: theme.borderRadiusLG,
          overflow: 'hidden',
        }}
        variant={'filled'}
        width={RECENT_BLOCK_SIZE.AGENT.WIDTH}
      >
        <Block
          flex={1}
          padding={12}
          style={{
            backgroundColor: theme.isDarkMode ? theme.colorFillQuaternary : theme.colorBgContainer,
            borderRadius: theme.borderRadiusLG,
            boxShadow: '0 4px 8px -2px rgba(0,0,0,.02)',
            overflow: 'hidden',
          }}
          variant={'outlined'}
        >
          <Text color={theme.colorTextSecondary} ellipsis={{ rows: 3 }} fontSize={13}>
            {description}
          </Text>
        </Block>
        <Flexbox gap={8} horizontal paddingBlock={8} paddingInline={12}>
          <Flexbox
            flex={1}
            gap={1}
            style={{
              overflow: 'hidden',
            }}
          >
            <Text ellipsis fontSize={13} weight={500}>
              {title}
            </Text>
            <Text ellipsis fontSize={12} type={'secondary'}>
              {author}
            </Text>
          </Flexbox>
          <Avatar
            avatar={avatar || DEFAULT_AVATAR}
            background={backgroundColor || undefined}
            shape={'square'}
            size={36}
            style={{
              flex: 'none',
            }}
          />
        </Flexbox>
      </Block>
    );
  },
);

export default CommunityAgentItem;
