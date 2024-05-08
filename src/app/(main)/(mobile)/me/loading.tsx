'use client';

import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Divider from '@/components/Cell/Divider';
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
        <Skeleton.Button active block />
      </Flexbox>
      <Flexbox gap={4} horizontal paddingBlock={12} paddingInline={16}>
        <Skeleton.Button active block />
        <Skeleton.Button active block />
        <Skeleton.Button active block />
      </Flexbox>
      <Divider />
      <SkeletonLoading
        active
        paragraph={{ rows: 6, style: { marginBottom: 0 }, width: '100%' }}
        title={false}
      />
      <Divider />
      <SkeletonLoading
        active
        paragraph={{ rows: 3, style: { marginBottom: 0 }, width: '100%' }}
        title={false}
      />
    </>
  );
});

export default Loading;
