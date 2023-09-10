import { Skeleton } from 'antd';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { useStyles } from '@/pages/market/features/SideBar/AgentInfo/style';

const Loading = memo(() => {
  const { styles } = useStyles();
  return (
    <>
      <Center className={styles.container} gap={16} style={{ paddingTop: 60 }}>
        <Skeleton.Avatar active shape={'circle'} size={100} />
        <Skeleton
          active
          paragraph={{ rows: 3, width: ['100%', '100%', '100%'] }}
          title={{ width: '100%' }}
        />
        <Skeleton.Button active block />
      </Center>
      <Center gap={16} style={{ padding: 16 }}>
        <Flexbox gap={16} horizontal>
          <Skeleton.Button active size={'small'} />
          <Skeleton.Button active size={'small'} />
        </Flexbox>
        <Skeleton active paragraph={{ rows: 6 }} title={false} />
      </Center>
    </>
  );
});

export default Loading;
