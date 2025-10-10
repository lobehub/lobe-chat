import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { BlockProps } from '@/components/Block';

export interface CardProps extends BlockProps {
  contentStyle?: StyleProp<ViewStyle>;
  cover?: ReactNode;
  coverStyle?: StyleProp<ViewStyle>;
  divider?: boolean;
  extra?: ReactNode;
  headerStyle?: StyleProp<ViewStyle>;
  title?: ReactNode;
  titleStyle?: StyleProp<TextStyle>;
}
