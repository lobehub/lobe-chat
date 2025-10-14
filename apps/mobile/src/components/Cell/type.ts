import { ReactNode } from 'react';

import type { BlockProps } from '@/components/Block';
import type { IconProps } from '@/components/Icon';

export interface CellProps extends Omit<BlockProps, 'children'> {
  arrowIcon?: IconProps['icon'];
  description?: ReactNode | string;
  extra?: ReactNode | string;
  icon?: IconProps['icon'];
  iconSize?: number;
  loading?: boolean;
  showArrow?: boolean;
  title: ReactNode | string;
}
