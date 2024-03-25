import { FC, PropsWithChildren } from 'react';

import { isMobileDevice } from '@/utils/responsive';

interface ServerLayoutProps {
  Desktop: FC<PropsWithChildren>;
  Mobile: FC<PropsWithChildren>;
}

const mobile = isMobileDevice();

const ServerLayout =
  ({ Desktop, Mobile }: ServerLayoutProps) =>
  ({ children }: PropsWithChildren) => {
    return mobile ? <Mobile>{children}</Mobile> : <Desktop>{children}</Desktop>;
  };

ServerLayout.displayName = 'ServerLayout';

export default ServerLayout;
