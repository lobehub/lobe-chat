import { Skeleton } from 'antd';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { useStyles } from './style';

const Loading = memo(() => {
  const { styles } = useStyles();
  return (
    <>
      <Center className={styles.container} gap={16} style={{ paddingTop: 80 }}>
        <Skeleton.Avatar active shape={'circle'} size={100} />
        <Skeleton
          active
          className={styles.loading}
          paragraph={{
            rows: 3,
            style: {
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
            },
            width: ['60%', '80%', '20%'],
          }}
          title={{
            style: {
              alignSelf: 'center',
              marginBottom: 0,
            },
            width: '50%',
          }}
        />
        <Skeleton.Button active block />
        <Skeleton
          active
          className={styles.loading}
          paragraph={{
            rows: 1,
            style: {
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              marginBottom: 0,
            },
            width: ['20%'],
          }}
          title={false}
        />
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
