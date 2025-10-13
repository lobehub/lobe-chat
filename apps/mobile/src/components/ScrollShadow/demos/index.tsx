import { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import OrientationsDemo from './orientations';
import SizesDemo from './sizes';
import VisibilityDemo from './visibility';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <OrientationsDemo />, key: 'orientations', title: '滚动方向' },
  { component: <SizesDemo />, key: 'sizes', title: '阴影大小' },
  { component: <VisibilityDemo />, key: 'visibility', title: '可见性模式' },
];

export default demos;
