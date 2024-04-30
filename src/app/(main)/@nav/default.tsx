import { isMobileDevice } from '@/utils/responsive';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const Default = () => {
  const mobile = isMobileDevice();

  const Nav = mobile ? Mobile : Desktop;

  return <Nav />;
};

Default.displayName = 'Nav';

export default Default;
