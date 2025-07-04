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
          <Skeleton.Button active style={{ width: '95%', height: 20 }} />

          {/* Metadata skeleton */}
          <Flexbox gap={12} horizontal style={{ width: '100%' }}>
            <Skeleton.Button active style={{ width: 120, height: 16 }} />
            <Skeleton.Button active style={{ width: 80, height: 16 }} />
            <Skeleton.Button active style={{ width: 60, height: 16 }} />
            <Skeleton.Button active style={{ width: 70, height: 16 }} />
          </Flexbox>

          {/* Image grid skeleton - 2x2 layout */}
          <Grid maxItemWidth={200} rows={4} width={'100%'}>
            {Array.from({ length: 4 }).map((_, imageIndex) => (
              <Skeleton.Button active key={imageIndex} style={{ width: '100%', height: 200 }} />
            ))}
          </Grid>
        </Flexbox>
      </Block>
      <div style={{ flex: 1 }} />
      <Center
        style={{
          position: 'sticky',
          bottom: 24,
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
