'use client';

import { FC, memo } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';

interface ClientResponsiveContentProps {
  Desktop: FC;
  Mobile: FC;
}

const ClientResponsiveContent = ({ Mobile, Desktop }: ClientResponsiveContentProps) => {
  const Content = memo(() => {
    const mobile = useIsMobile();

    return mobile ? <Mobile /> : <Desktop />;
  });

  Content.displayName = 'ClientResponsiveContent';

  return Content;
};

export default ClientResponsiveContent;
