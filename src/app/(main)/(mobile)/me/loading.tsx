'use client';

import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SkeletonLoading from '@/components/SkeletonLoading';

import { useStyles } from './features/style';

const Loading = memo(() => {
  const { styles } = useStyles();
  return (
    <>
      <Flexbox align={'center'} className={styles.bannerBox} justify={'center'} />
      <Flexbox
        align={'center'}
        className={styles.info}
        gap={12}
        horizontal
        paddingBlock={12}
        paddingInline={12}
      >
        <Skeleton.Avatar active shape={'circle'} size={48} />
        <Skeleton active paragraph={{ rows: 1 }} title={false} />
      </Flexbox>
      <SkeletonLoading active paragraph={{ rows: 8 }} title={false} />
    </>
  );
});

export default Loading;
