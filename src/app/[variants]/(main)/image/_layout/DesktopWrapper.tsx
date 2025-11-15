'use client';

import { memo } from 'react';

import Menu from '../@menu/default';
import Topic from '../@topic/default';
import Desktop from './Desktop';

const DesktopImageWrapper = memo(() => {
  return <Desktop menu={<Menu />} topic={<Topic />} />;
});

DesktopImageWrapper.displayName = 'DesktopImageWrapper';

export default DesktopImageWrapper;
