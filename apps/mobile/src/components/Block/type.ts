import type { FlexboxProps } from '@/components/Flexbox';

export interface BlockProps extends FlexboxProps {
  glass?: boolean;
  onPress?: () => void;
  shadow?: boolean;
  variant?: 'filled' | 'outlined' | 'borderless';
}
