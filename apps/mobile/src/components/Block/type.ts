import type { FlexboxProps } from '../Flexbox';

export interface BlockProps extends FlexboxProps {
  glass?: boolean;
  onPress?: () => void;
  shadow?: boolean;
  variant?: 'filled' | 'outlined' | 'borderless';
}
