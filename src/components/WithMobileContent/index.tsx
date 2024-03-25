'use client';

import { FC, ReactNode, memo } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';

interface WithMobileContentProps {
  Mobile: FC;
  children: ReactNode;
}

const WithMobileContent = memo(({ children, Mobile }: WithMobileContentProps) => {
  const mobile = useIsMobile();

  return mobile ? <Mobile /> : children;
});

WithMobileContent.displayName = 'ResponsiveContainer';

export default WithMobileContent;
