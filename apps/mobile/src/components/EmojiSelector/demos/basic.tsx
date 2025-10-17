import { EmojiSelector, Flexbox } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox flex={1}>
      <EmojiSelector
        onChange={(emoji) => {
          console.log(emoji);
        }}
      />
    </Flexbox>
  );
};
