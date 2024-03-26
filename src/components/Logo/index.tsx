import Image from 'next/image';
import { memo } from 'react';

import logo from '@/../public/images/logo.png';

const Logo = memo<{ size: number }>(({ size = 32 }) => (
  <Image alt="lobehub" height={size} src={logo} width={size} />
));

export default Logo;
