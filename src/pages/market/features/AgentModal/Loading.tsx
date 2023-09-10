import { Skeleton } from 'antd';
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from '@/pages/market/features/AgentModal/style';

const Loading = memo(() => {
  const { styles } = useStyles();
  const { mobile } = useResponsive();

  if (mobile) return <Skeleton active avatar paragraph={{ rows: 15 }} />;

  return (
    <Flexbox gap={32} horizontal>
      <Flexbox flex={1}>
        <Skeleton active avatar paragraph={{ rows: 15 }} />
      </Flexbox>
      <Flexbox className={styles.prompt} flex={1}>
        <Skeleton active paragraph={{ rows: 16 }} />
      </Flexbox>
    </Flexbox>
  );
});

export default Loading;
