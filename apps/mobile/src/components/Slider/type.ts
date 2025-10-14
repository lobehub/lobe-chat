import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export interface SliderProps {
  defaultValue?: number;
  disabled?: boolean;
  marks?: Record<
    number,
    | ReactNode
    | {
        label: ReactNode;
        style?: ViewStyle;
      }
  >;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  onChangeComplete?: (value: number) => void;
  step?: number | null;
  style?: ViewStyle;
  value?: number;
}
