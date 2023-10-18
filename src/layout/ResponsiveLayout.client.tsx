'use client';

import { PropsWithChildren, ReactNode, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import FullscreenLoading from '@/components/FullscreenLoading';
import { useIsMobile } from '@/hooks/useIsMobile';

interface ServerResponsiveLayoutProps {
  Desktop: (props: PropsWithChildren) => ReactNode;
  Mobile: (props: PropsWithChildren) => ReactNode;
  children?: ReactNode;
}
const ResponsiveLayout = ({ children, Desktop, Mobile }: ServerResponsiveLayoutProps) => {
  const { t } = useTranslation();
  const mobile = useIsMobile();

  return mobile ? (
    <Suspense fallback={<FullscreenLoading title={t('layoutInitializing', { ns: 'common' })} />}>
      <Mobile>{children}</Mobile>
    </Suspense>
  ) : (
    <Desktop>{children}</Desktop>
  );
};

export default ResponsiveLayout;
