import { useResponsive } from 'antd-style';
import { memo } from 'react';

import Mobile from '../../../components/ChatHeader/Mobile';
import Desktop from './Desktop';

const Header = memo(() => {
  const { mobile } = useResponsive();
  const Render = mobile ? Mobile : Desktop;

  return <Render />;
});

export default Header;
