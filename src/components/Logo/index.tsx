import Image from 'next/image';
import { memo } from 'react';

import { imageUrl } from '@/const/url';

const Logo = memo<{ size: number }>(({ size = 32 }) => (
  <Image alt="lobehub" height={size} src={imageUrl('logo.png')} width={size} />
));

export default Logo;
