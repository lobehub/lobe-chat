import type { ReactNode } from 'react';

import type { BlockProps } from '@/components/Block';

export interface CardProps extends BlockProps {
  cover?: ReactNode;
  divider?: boolean;
  extra?: ReactNode;
  title?: ReactNode;
}
