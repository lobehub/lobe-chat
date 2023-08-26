import { useResponsive } from 'antd-style';
import { memo } from 'react';

import Mobile from './Mobile';
import PC from './PC';

const Header = memo<{ settings?: boolean }>((props) => {
  const { mobile } = useResponsive();

  if (mobile) return <Mobile {...props} />;

  return <PC {...props} />;
});

export default Header;
