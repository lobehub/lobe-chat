import type { FlexboxProps } from '../Flexbox';

export interface BlockProps extends FlexboxProps {
  clickable?: boolean;
  onPress?: () => void;
  shadow?: boolean;
  variant?: 'filled' | 'outlined' | 'borderless';
}
