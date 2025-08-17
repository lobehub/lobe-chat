import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export interface ColorSwatchesItemType {
  color: string;
  key?: string | number;
  title?: ReactNode;
}

export interface ColorSwatchesProps {
  colors: ColorSwatchesItemType[];
  defaultValue?: string;
  enableColorSwatches?: boolean;
  gap?: number;
  onChange?: (color: string) => void;
  shape?: 'circle' | 'square';
  size?: number;
  style?: ViewStyle;
  value?: string;
}
