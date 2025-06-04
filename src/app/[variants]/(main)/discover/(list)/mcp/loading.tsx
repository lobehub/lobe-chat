'use client';

import { Block, Grid } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const Loading = memo(() => {
  return (
    <Flexbox style={{ marginBlock: 24 }} width={'100%'}>
      <Grid rows={3} width={'100%'}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Block gap={24} key={index} padding={16} variant={'outlined'}>
            <Flexbox align={'center'} gap={8} horizontal>
              <Skeleton.Avatar active key={index} size={40} />
              <Skeleton.Button active style={{ height: 32, width: 120 }} />
            </Flexbox>
            <Skeleton paragraph={{ rows: 4 }} title={false} />
          </Block>
        ))}
      </Grid>
    </Flexbox>
  );
});

export default Loading;
