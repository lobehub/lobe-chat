'use client';

import { memo } from 'react';

import Category from '../@category/default';
import Desktop from './Desktop';

const DesktopProfileWrapper = memo(() => {
  return <Desktop category={<Category />} />;
});

DesktopProfileWrapper.displayName = 'DesktopProfileWrapper';

export default DesktopProfileWrapper;
