import { ReactNode } from 'react';

import type { BlockProps } from '@/components/Block';
import type { IconProps } from '@/components/Icon';
import type { TextProps } from '@/components/Text';

export interface CellProps extends Omit<BlockProps, 'children'> {
  arrowIcon?: IconProps['icon'];
  description?: ReactNode | string;
  descriptionProps?: Omit<TextProps, 'children'>;
  extra?: ReactNode | string;
  icon?: IconProps['icon'];
  iconSize?: number;
  loading?: boolean;
  showArrow?: boolean;
  title: ReactNode | string;
  titleProps?: Omit<TextProps, 'children'>;
}
