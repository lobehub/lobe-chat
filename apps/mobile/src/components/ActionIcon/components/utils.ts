import { isNumber } from 'lodash-es';

import type { ActionIconSize } from '../type';

export const calcSize = (iconSize?: ActionIconSize) => {
  let blockSize: number | string;
  let borderRadius: number | string;

  if (isNumber(iconSize)) {
    const blockSize = iconSize * 1.8;
    return {
      blockSize,
      borderRadius: Math.floor(blockSize / 6),
    };
  }

  switch (iconSize) {
    case 'large': {
      blockSize = 44;
      borderRadius = 22;
      break;
    }
    case 'middle': {
      blockSize = 38;
      borderRadius = 19;
      break;
    }
    case 'small': {
      blockSize = 32;
      borderRadius = 16;
      break;
    }
    default: {
      if (iconSize) {
        blockSize = iconSize?.blockSize || 36;
        borderRadius =
          iconSize?.borderRadius || (iconSize?.blockSize ? Number(iconSize.blockSize) / 2 : 18);
      } else {
        blockSize = '1.8em';
        borderRadius = '0.3em';
      }

      break;
    }
  }

  return {
    blockSize,
    borderRadius,
  };
};
