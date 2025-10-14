import type { ColorScaleItem } from '@/components/styles';

export interface ColorScalesProps {
  /**
   * @description Index of the mid highlight color in the scale
   */
  midHighLight: number;
  /**
   * @description Name of the color scale
   */
  name: string;
  /**
   * @description Color scale item object
   */
  scale: ColorScaleItem;
}
