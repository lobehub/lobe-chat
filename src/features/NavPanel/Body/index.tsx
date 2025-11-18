'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface BodyProps {
  expand: boolean;
}

const Body = memo<BodyProps>(() => {
  return <Flexbox>1222</Flexbox>;
});

export default Body;
