import React, { memo } from 'react';

import Block from '../../Block';
import Center from '../../Center';
import Text from '../../Text';
import { charFromEmojiObject } from '../constants';
import { useStyles } from '../style';
import type { EmojiCellProps } from '../type';

const EmojiCell = memo<EmojiCellProps>(({ emoji, colSize, onPress, active }) => {
  const { styles } = useStyles();
  const emojiSize = Math.max(Math.floor(colSize * 0.6), 20);

  return (
    <Center height={colSize} padding={1} width={colSize}>
      <Block
        active={active}
        align={'center'}
        height={colSize - 2}
        justify={'center'}
        onPress={onPress}
        pressEffect
        variant={active ? 'outlined' : 'borderless'}
        width={colSize - 2}
      >
        <Text style={[styles.emojiText, { fontSize: emojiSize }]}>
          {charFromEmojiObject(emoji)}
        </Text>
      </Block>
    </Center>
  );
});

EmojiCell.displayName = 'EmojiCell';

export default EmojiCell;
