import { Flexbox, LobeHub } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={24}>
      <LobeHub extra="Discover" size={64} type="3d" />
      <LobeHub extra="Discover" size={64} type="combine" />
    </Flexbox>
  );
};
