import { Flexbox, LobeHub } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={24}>
      <LobeHub size={64} type="3d" />
      <LobeHub size={64} type="flat" />
      <LobeHub size={64} type="mono" />
      <LobeHub size={64} type="text" />
      <LobeHub size={64} type="combine" />
    </Flexbox>
  );
};
