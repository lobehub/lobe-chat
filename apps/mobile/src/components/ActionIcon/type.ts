import type { ReactNode } from 'react';
import type { ColorValue } from 'react-native';

import type { BlockProps } from '@/components/Block';
import type { IconProps, IconSizeConfig, IconSizeType, LucideIconProps } from '@/components/Icon';

interface ActionIconSizeConfig extends IconSizeConfig {
  blockSize?: number | string;
  borderRadius?: number | string;
}

export type ActionIconSize = number | IconSizeType | ActionIconSizeConfig;

export interface ActionIconProps extends Partial<LucideIconProps>, Omit<BlockProps, 'children'> {
  color?: ColorValue;
  danger?: boolean;
  disabled?: boolean;
  icon?: IconProps['icon'] | ReactNode;
  loading?: boolean;
  size?: ActionIconSize;
  spin?: boolean;
}
