'use client';

import { FC, ReactNode, memo } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';

interface ResponsiveContainerProps {
  Mobile: FC;
  children: ReactNode;
}

const ResponsiveContainer = memo(({ children, Mobile }: ResponsiveContainerProps) => {
  const mobile = useIsMobile();

  return mobile ? <Mobile /> : children;
});

ResponsiveContainer.displayName = 'ResponsiveContainer';

export default ResponsiveContainer;
