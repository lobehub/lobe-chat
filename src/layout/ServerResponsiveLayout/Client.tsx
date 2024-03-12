'use client';

import { ReactNode, memo } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';

interface ServerResponsiveLayoutProps extends Record<string, any> {
  Desktop: (props: any) => ReactNode;
  Mobile: (props: any) => ReactNode;
  children?: ReactNode;
}

const ResponsiveLayout = memo(
  ({ children, Desktop, Mobile, ...res }: ServerResponsiveLayoutProps) => {
    const mobile = useIsMobile();

    return mobile ? <Mobile {...res}>{children}</Mobile> : <Desktop {...res}>{children}</Desktop>;
  },
);

ResponsiveLayout.displayName = 'ClientResponsiveLayout';

export default ResponsiveLayout;
