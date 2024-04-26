import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import Banner from '@/app/welcome/features/Banner';

const Showcase = memo(() => (
  <Flexbox align={'center'} justify={'center'} style={{ height: 'calc(100% - 44px)' }}>
    <Center gap={16}>
      <Banner mobile />
    </Center>
    {/*TODO：暂时隐藏，待模板完成后再补回*/}
    {/*<AgentTemplate width={width} />*/}
  </Flexbox>
));

export default Showcase;
