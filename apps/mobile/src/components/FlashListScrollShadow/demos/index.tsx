import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import AlwaysVisibleDemo from './alwaysVisible';
import BasicDemo from './basic';
import CustomSizeDemo from './customSize';
import HorizontalDemo from './horizontal';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <HorizontalDemo />, key: 'horizontal', title: '水平滚动' },
  { component: <CustomSizeDemo />, key: 'custom-size', title: '自定义阴影大小' },
  { component: <AlwaysVisibleDemo />, key: 'always-visible', title: '始终显示阴影' },
];

export default demos;
