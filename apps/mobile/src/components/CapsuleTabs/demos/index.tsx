import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import IconsDemo from './icons';
import ScrollingDemo from './scrolling';
import SizesDemo from './sizes';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸大小' },
  { component: <IconsDemo />, key: 'icons', title: '图标组合' },
  { component: <ScrollingDemo />, key: 'scrolling', title: '水平滚动' },
];

export default demos;
