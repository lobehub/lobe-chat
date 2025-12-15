import { Grid, Skeleton } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ViewMode } from './ViewModeSwitcher';

const Loading = memo<{ rows?: number; viewMode?: ViewMode }>(({ viewMode, rows = 3 }) => {
  if (viewMode === 'timeline') {
    return (
      <Flexbox gap={36} style={{ paddingLeft: 32 }}>
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </Flexbox>
    );
  }

  return (
    <Grid gap={8} maxItemWidth={240} rows={rows}>
      <Skeleton.Block active height={200} width={'100%'} />
      <Skeleton.Block active height={200} width={'100%'} />
      <Skeleton.Block active height={200} width={'100%'} />
      <Skeleton.Block active height={200} width={'100%'} />
      <Skeleton.Block active height={200} width={'100%'} />
      <Skeleton.Block active height={200} width={'100%'} />
    </Grid>
  );
});

export default Loading;
