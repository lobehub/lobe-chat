import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import ClickableDemo from './clickable';
import LayoutDemo from './layout';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ClickableDemo />, key: 'clickable', title: '可点击状态' },
  { component: <LayoutDemo />, key: 'layout', title: '布局示例' },
];

export default demos;
