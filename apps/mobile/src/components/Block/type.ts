import type { FlexboxProps } from '../Flexbox';

export interface BlockProps extends FlexboxProps {
  clickable?: boolean;
  glass?: boolean;
  onPress?: () => void;
  shadow?: boolean;
  variant?: 'filled' | 'outlined' | 'borderless';
}
