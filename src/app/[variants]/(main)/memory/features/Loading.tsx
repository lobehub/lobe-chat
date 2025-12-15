import { Grid, Skeleton } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ViewMode } from './ViewModeSwitcher';

const Loading = memo<{ viewMode?: ViewMode }>(({ viewMode }) => {
  if (viewMode === 'timeline') {
    return (
      <Flexbox gap={36}>
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </Flexbox>
    );
  }

  return (
    <Grid gap={16} rows={3}>
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
