import type { ColorScaleItem } from '@/color/types';

import mauve from './mauve';
import olive from './olive';
import sage from './sage';
import sand from './sand';
import slate from './slate';

export interface NeutralColorScales {
  mauve: ColorScaleItem;
  olive: ColorScaleItem;
  sage: ColorScaleItem;
  sand: ColorScaleItem;
  slate: ColorScaleItem;
}

export const neutralColorScales: NeutralColorScales = {
  mauve,
  olive,
  sage,
  sand,
  slate,
};

export { neutralColorScales as neutrals };
export { default as mauve } from './mauve';
export { default as olive } from './olive';
export { default as sage } from './sage';
export { default as sand } from './sand';
export { default as slate } from './slate';
