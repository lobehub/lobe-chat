import { isNumber } from 'lodash-es';

import { ICON_SIZE, ICON_SIZE_LARGE, ICON_SIZE_SMALL } from '@/_const/common';

import type { IconSize } from '../type';

export const calcSize = (iconSize?: IconSize) => {
  if (isNumber(iconSize)) {
    return { size: iconSize };
  }

  let size: number | string;
  let strokeWidth: number | string;

  switch (iconSize) {
    case 'large': {
      size = ICON_SIZE_LARGE;
      strokeWidth = 2;
      break;
    }
    case 'middle': {
      size = ICON_SIZE;
      strokeWidth = 2;
      break;
    }
    case 'small': {
      size = ICON_SIZE_SMALL;
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
