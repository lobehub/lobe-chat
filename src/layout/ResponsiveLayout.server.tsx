import { PropsWithChildren, ReactNode } from 'react';

import { isMobileDevice } from '@/utils/responsive';

interface ServerResponsiveLayoutProps {
  Desktop: (props: PropsWithChildren) => ReactNode;
  Mobile: (props: PropsWithChildren) => ReactNode;
  children?: ReactNode;
}
const ResponsiveLayout = ({ children, Desktop, Mobile }: ServerResponsiveLayoutProps) => {
  const mobile = isMobileDevice();

  return mobile ? <Mobile>{children}</Mobile> : <Desktop>{children}</Desktop>;
};

export default ResponsiveLayout;
