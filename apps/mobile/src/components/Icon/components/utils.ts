import { isNumber } from 'lodash-es';

import type { IconSize } from '../type';

export const calcSize = (iconSize?: IconSize) => {
  if (isNumber(iconSize)) {
    return { size: iconSize };
  }

  let size: number | string;
  let strokeWidth: number | string;

  switch (iconSize) {
    case 'large': {
      size = 24;
      strokeWidth = 2;
      break;
    }
    case 'middle': {
      size = 20;
      strokeWidth = 2;
      break;
    }
    case 'small': {
      size = 14;
      strokeWidth = 2;
      break;
    }
    default: {
      if (iconSize) {
        size = iconSize?.size || 24;
        strokeWidth = iconSize?.strokeWidth || 2;
      } else {
        size = '1em';
        strokeWidth = 2;
      }
      break;
    }
  }
  return { size, strokeWidth };
};
