import { FC, PropsWithChildren } from 'react';

import { isMobileDevice } from '@/utils/responsive';

interface ServerLayoutProps<T> {
  Desktop: FC<T>;
  Mobile: FC<T>;
}

const ServerLayout =
  <T extends PropsWithChildren>({ Desktop, Mobile }: ServerLayoutProps<T>): FC<T> =>
  (props: T) => {
    const mobile = isMobileDevice();
    return mobile ? <Mobile {...props} /> : <Desktop {...props} />;
  };

ServerLayout.displayName = 'ServerLayout';

export default ServerLayout;
