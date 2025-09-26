import type { FlexboxProps } from '@/components/Flexbox';

export interface BlockProps extends FlexboxProps {
  clickable?: boolean;
  glass?: boolean;
  onPress?: () => void;
  shadow?: boolean;
  variant?: 'filled' | 'outlined' | 'borderless';
}
