import { ReactNode } from 'react';

import type { FlexboxProps } from '@/components/Flexbox';
import type { IconProps } from '@/components/Icon';

export interface EmptyProps extends FlexboxProps {
  description?: ReactNode | string;
  icon?: IconProps['icon'];
  iconProps?: Omit<IconProps, 'icon' | 'size'>;
  iconSize?: IconProps['size'];
}
