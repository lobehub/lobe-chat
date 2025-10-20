import type { Href } from 'expo-router';
import type { ReactNode } from 'react';

import type { BlockProps } from '../Block';

export interface ListItemProps extends BlockProps {
  avatar?: string | ReactNode;
  description?: string;
  extra?: ReactNode;
  href?: Href;
  title: string;
}
