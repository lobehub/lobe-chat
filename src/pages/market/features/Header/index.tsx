import { useResponsive } from 'antd-style';
import { memo } from 'react';

import Desktop from './Desktop';
import Mobile from './Mobile';

const Header = memo(() => {
  const { mobile } = useResponsive();
  const Render = mobile ? Mobile : Desktop;
  return <Render />;
});

export default Header;
