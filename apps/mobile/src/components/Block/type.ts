import type { FlexboxProps } from '../Flexbox';

export interface BlockProps extends FlexboxProps {
  active?: boolean;
  borderRadius?: boolean | number;
  longPressEffect?: boolean;
  pressEffect?: boolean;
  shadow?: boolean;
  variant?: 'filled' | 'outlined' | 'borderless';
}
