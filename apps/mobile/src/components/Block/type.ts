import type { FlexboxProps } from '../Flexbox';

export interface BlockProps extends FlexboxProps {
  active?: boolean;
  borderRadius?: number;
  clickable?: boolean;

  shadow?: boolean;
  variant?: 'filled' | 'outlined' | 'borderless';
}
