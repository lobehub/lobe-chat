import { Button, Flexbox } from '@lobehub/ui-rn';
import React, { useState } from 'react';

import ImageGallery from '../ImageGallery';

export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <Flexbox>
      <Button onPress={() => setVisible(true)}>查看图片</Button>
      {visible && (
        <ImageGallery
          images={[
            'https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d',
          ]}
          initialIndex={0}
          onClose={() => setVisible(false)}
        />
      )}
    </Flexbox>
  );
};
