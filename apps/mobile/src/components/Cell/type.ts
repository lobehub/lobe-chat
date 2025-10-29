import { ReactNode } from 'react';

import type { BlockProps } from '@/components/Block';
import type { FlexboxProps } from '@/components/Flexbox';
import type { IconProps } from '@/components/Icon';
import type { TextProps } from '@/components/Text';

export interface CellProps extends Omit<BlockProps, 'children'> {
  arrowIcon?: IconProps['icon'];
  arrowIconProps?: Omit<IconProps, 'icon'>;
  danger?: boolean;
  description?: ReactNode | string;
  descriptionProps?: Omit<TextProps, 'children'>;
  extra?: ReactNode | string;
  extraProps?: Omit<TextProps, 'children'>;
  headerProps?: Omit<FlexboxProps, 'children'>;
  icon?: IconProps['icon'];
  iconProps?: Omit<IconProps, 'icon' | 'size'>;
  iconSize?: number;
  loading?: boolean;
  showArrow?: boolean;
  title: ReactNode | string;
  titleProps?: Omit<TextProps, 'children'>;
}
