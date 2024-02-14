'use client';

import { ReactNode, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import FullscreenLoading from '@/components/FullscreenLoading';
import { useIsMobile } from '@/hooks/useIsMobile';

interface ServerResponsiveLayoutProps extends Record<string, any> {
  Desktop: (props: any) => ReactNode;
  Mobile: (props: any) => ReactNode;
  children?: ReactNode;
}
const ResponsiveLayout = ({ children, Desktop, Mobile, ...res }: ServerResponsiveLayoutProps) => {
  const { t } = useTranslation();
  const mobile = useIsMobile();

  return mobile ? (
    <Suspense fallback={<FullscreenLoading title={t('layoutInitializing', { ns: 'common' })} />}>
      <Mobile {...res}>{children}</Mobile>
    </Suspense>
  ) : (
    <Desktop {...res}>{children}</Desktop>
  );
};

export default ResponsiveLayout;
