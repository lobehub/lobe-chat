import { FC, PropsWithChildren } from 'react';

import { isMobileDevice } from '@/utils/server/responsive';

interface ServerLayoutProps<T> {
  Desktop: FC<T>;
  Mobile: FC<T>;
}

const ServerLayout =
  <T extends PropsWithChildren>({ Desktop, Mobile }: ServerLayoutProps<T>): FC<T> =>
  async (props: T) => {
    const mobile = await isMobileDevice();
    return mobile ? <Mobile {...props} /> : <Desktop {...props} />;
  };

ServerLayout.displayName = 'ServerLayout';

export default ServerLayout;
