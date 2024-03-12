import { ReactNode } from 'react';

import { isMobileDevice } from '@/utils/responsive';

interface ServerResponsiveLayoutProps extends Record<string, any> {
  Desktop: (props: any) => ReactNode;
  Mobile: (props: any) => ReactNode;
  children?: ReactNode;
}
const ServerResponsiveLayout = ({
  children,
  Desktop,
  Mobile,
  ...res
}: ServerResponsiveLayoutProps) => {
  const mobile = isMobileDevice();

  return mobile ? <Mobile {...res}>{children}</Mobile> : <Desktop {...res}>{children}</Desktop>;
};

export default ServerResponsiveLayout;
