import { useResponsive } from 'antd-style';
import { memo } from 'react';

import Mobile from './Mobile';
import PC from './PC';

const Header = memo(() => {
  const { mobile } = useResponsive();

  if (mobile) return <Mobile />;

  return <PC />;
});

export default Header;
