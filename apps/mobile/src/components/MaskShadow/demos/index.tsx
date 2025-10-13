import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import PositionsDemo from './positions';
import SizesDemo from './sizes';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <PositionsDemo />, key: 'positions', title: '不同方向' },
  { component: <SizesDemo />, key: 'sizes', title: '阴影大小' },
];

export default demos;
