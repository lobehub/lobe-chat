import { PropsWithChildren } from 'react';

import { isMobileDevice } from '@/utils/responsive';

import Desktop from './Desktop';
import Mobile from './Mobile';

const mobile = isMobileDevice();

const GlobalLayout = ({ children }: PropsWithChildren) => {
  return mobile ? <Mobile>{children}</Mobile> : <Desktop>{children}</Desktop>;
};

export default GlobalLayout;
