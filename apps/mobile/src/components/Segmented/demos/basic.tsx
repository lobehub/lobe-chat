import { Flexbox, Segmented } from '@lobehub/ui-rn';
import React, { useState } from 'react';

export default () => {
  const [value, setValue] = useState<string | number>('iOS');

  return (
    <Flexbox gap={16}>
      <Segmented onChange={setValue} options={['iOS', 'Android', 'Web']} value={value} />
    </Flexbox>
  );
};
