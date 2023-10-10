'use client';

import { FC, ReactNode } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';

interface ResponsiveIndexProps {
  Mobile: FC;
  children: ReactNode;
}
const ResponsiveIndex = ({ children, Mobile }: ResponsiveIndexProps) => {
  const mobile = useIsMobile();

  return mobile ? <Mobile /> : children;
};

export default ResponsiveIndex;
