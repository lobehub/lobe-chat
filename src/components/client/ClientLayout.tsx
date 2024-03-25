'use client';

import { FC, PropsWithChildren, memo } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';

interface ClientLayoutProps {
  Desktop: FC<PropsWithChildren>;
  Mobile: FC<PropsWithChildren>;
}

const ClientLayout = ({ Desktop, Mobile }: ClientLayoutProps) =>
  memo<PropsWithChildren>(({ children }) => {
    const mobile = useIsMobile();

    return mobile ? <Mobile>{children}</Mobile> : <Desktop>{children}</Desktop>;
  });

ClientLayout.displayName = 'ClientLayout';

export default ClientLayout;
