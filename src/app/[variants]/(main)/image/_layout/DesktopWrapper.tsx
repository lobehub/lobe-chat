'use client';

import { memo } from 'react';

import Menu from '@/app/[variants]/(main)/image/Menu';
import Topic from '@/app/[variants]/(main)/image/TopicGallery';

import Desktop from './index';

const DesktopImageWrapper = memo(() => {
  return <Desktop menu={<Menu />} topic={<Topic />} />;
});

DesktopImageWrapper.displayName = 'DesktopImageWrapper';

export default DesktopImageWrapper;
