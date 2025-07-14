'use client';

import { Block, Grid } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import PromptInput from '@/app/[variants]/(main)/image/features/PromptInput';

const SkeletonList = memo(() => {
  return (
    <>
      <Block variant={'borderless'}>
        <Flexbox gap={12}>
          {/* Prompt text skeleton */}
          <Skeleton.Button active style={{ height: 20, width: '95%' }} />

          {/* Metadata skeleton */}
          <Flexbox gap={12} horizontal style={{ width: '100%' }}>
            <Skeleton.Button active style={{ height: 16, width: 120 }} />
            <Skeleton.Button active style={{ height: 16, width: 80 }} />
            <Skeleton.Button active style={{ height: 16, width: 60 }} />
            <Skeleton.Button active style={{ height: 16, width: 70 }} />
          </Flexbox>

          {/* Image grid skeleton - 2x2 layout */}
          <Grid maxItemWidth={200} rows={4} width={'100%'}>
            {Array.from({ length: 4 }).map((_, imageIndex) => (
              <Skeleton.Button active key={imageIndex} style={{ height: 200, width: '100%' }} />
            ))}
          </Grid>
        </Flexbox>
      </Block>
      <div style={{ flex: 1 }} />
      <Center
        style={{
          bottom: 24,
          position: 'sticky',
          width: '100%',
        }}
      >
        <PromptInput disableAnimation={true} showTitle={false} />
      </Center>
    </>
  );
});

SkeletonList.displayName = 'SkeletonList';

export default SkeletonList;
