import type { ViewProps } from 'react-native';

export interface DividerProps extends Omit<ViewProps, 'children'> {
  type?: 'horizontal' | 'vertical';
}
