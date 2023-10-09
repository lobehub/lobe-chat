'use client';

import { PropsWithChildren, ReactNode } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';

interface ServerResponsiveLayoutProps {
  Desktop: (props: PropsWithChildren) => ReactNode;
  Mobile: (props: PropsWithChildren) => ReactNode;
  children?: ReactNode;
}
const ResponsiveLayout = ({ children, Desktop, Mobile }: ServerResponsiveLayoutProps) => {
  const mobile = useIsMobile();

  return mobile ? <Mobile>{children}</Mobile> : <Desktop>{children}</Desktop>;
};

export default ResponsiveLayout;
