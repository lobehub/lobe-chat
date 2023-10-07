import { PropsWithChildren, ReactNode } from 'react';

interface ServerResponsiveLayoutProps {
  Desktop: (props: PropsWithChildren) => ReactNode;
  Mobile: (props: PropsWithChildren) => ReactNode;
  children?: ReactNode;
  isMobile: () => boolean;
}
const ResponsiveLayout = ({ children, Desktop, Mobile, isMobile }: ServerResponsiveLayoutProps) => {
  const mobile = isMobile();

  return mobile ? <Mobile>{children}</Mobile> : <Desktop>{children}</Desktop>;
};

export default ResponsiveLayout;
