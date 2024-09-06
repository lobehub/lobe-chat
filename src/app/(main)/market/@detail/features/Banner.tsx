import { Avatar } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import AgentCardBanner from '../../features/AgentCard/AgentCardBanner';

const Banner = memo<{
  avatar?: string;
  backgroundColor?: string;
  loading?: boolean;
  mobile?: boolean;
}>(({ avatar, backgroundColor, mobile, loading }) => {
  const theme = useTheme();

  return (
    <Flexbox align={'center'}>
      <AgentCardBanner
        avatar={loading ? undefined : avatar}
        size={800}
        style={{ height: 120, marginBottom: -60 }}
      />
      <Center
        flex={'none'}
        height={120}
        style={{
          backgroundColor:
            backgroundColor || mobile ? theme.colorBgElevated : theme.colorBgContainer,
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 2,
        }}
        width={120}
      >
        {loading ? (
          <Skeleton.Avatar active size={100} />
        ) : (
          <Avatar animation avatar={avatar} shape={'circle'} size={100} />
        )}
      </Center>
    </Flexbox>
  );
});

export default Banner;
