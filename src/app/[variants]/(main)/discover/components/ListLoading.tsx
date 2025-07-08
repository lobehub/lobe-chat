'use client';

import { Block, Grid } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { useResponsive, useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const ListLoading = memo(() => {
  return (
    <Flexbox width={'100%'}>
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

export const DetailsLoading = memo(() => {
  const { mobile } = useResponsive();
  const theme = useTheme();
  return (
    <Flexbox gap={24}>
      <Flexbox gap={12}>
        {!mobile && <Skeleton paragraph={{ rows: 1 }} style={{ width: 200 }} title={false} />}
        <Flexbox align={'center'} gap={16} horizontal width={'100%'}>
          <Skeleton.Avatar active size={mobile ? 48 : 64} />
          <Skeleton.Button active style={{ height: 36, width: 200 }} />
        </Flexbox>
        <Skeleton.Button active size={'small'} style={{ width: 200 }} />
      </Flexbox>
      <Flexbox
        gap={12}
        height={54}
        horizontal
        style={{
          borderBottom: `1px solid ${theme.colorBorder}`,
        }}
      >
        <Skeleton.Button />
        <Skeleton.Button />
      </Flexbox>
      <Flexbox
        gap={48}
        horizontal={!mobile}
        style={mobile ? { flexDirection: 'column-reverse' } : undefined}
      >
        <Flexbox
          flex={1}
          gap={16}
          style={{
            overflow: 'hidden',
          }}
          width={'100%'}
        >
          <Skeleton paragraph={{ rows: 3 }} title={false} />
          <Skeleton paragraph={{ rows: 8 }} title={false} />
          <Skeleton paragraph={{ rows: 8 }} title={false} />
        </Flexbox>
        <Flexbox gap={16} width={360}>
          <Skeleton paragraph={{ rows: 3 }} title={false} />
          <Skeleton paragraph={{ rows: 4 }} title={false} />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});
export default ListLoading;
