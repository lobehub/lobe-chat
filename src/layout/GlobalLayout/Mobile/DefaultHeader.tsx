import { Logo, MobileNavBar } from '@lobehub/ui';
import { memo } from 'react';

const Header = memo(() => {
  return <MobileNavBar center={<Logo type={'text'} />} />;
});

export default Header;
