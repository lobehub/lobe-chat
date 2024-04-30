'use client';

import { GridShowcase } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Banner from '@/app/(main)/welcome/features/Banner';

const Showcase = memo(() => (
  <Flexbox
    flex={1}
    justify={'center'}
    style={{ height: '100%', position: 'relative', width: '100%' }}
  >
    <GridShowcase>
      <Banner />
    </GridShowcase>
    {/*TODO：暂时隐藏，待模板完成后再补回*/}
    {/*<AgentTemplate width={width} />*/}
  </Flexbox>
));

export default Showcase;
