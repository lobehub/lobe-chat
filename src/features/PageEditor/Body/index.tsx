'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import EditorCanvas from '../EditorCanvas';
import Title from './Title';

const Body = memo(() => {
  return (
    <Flexbox flex={1} style={{ overflowY: 'auto' }}>
      <Title />
      <EditorCanvas />
    </Flexbox>
  );
});

export default Body;
