import React, { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';
import InitProgress, { StageItem } from '@/components/InitProgress';

interface FullscreenLoadingProps {
  activeStage: number;
  stages: StageItem[];
}

const FullscreenLoading = memo<FullscreenLoadingProps>(({ activeStage, stages }) => {
  return (
    <Flexbox height={'100%'} style={{ position: 'relative', userSelect: 'none' }} width={'100%'}>
      <Center flex={1} gap={16} width={'100%'}>
        <ProductLogo size={48} type={'combine'} />
        <InitProgress activeStage={activeStage} stages={stages} />
      </Center>
    </Flexbox>
  );
});

export default FullscreenLoading;
