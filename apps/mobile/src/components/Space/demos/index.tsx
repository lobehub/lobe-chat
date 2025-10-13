import { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import AdvancedDemo from './advanced';
import AlignmentDemo from './alignment';
import BasicDemo from './basic';
import DirectionsDemo from './directions';
import SizesDemo from './sizes';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <DirectionsDemo />, key: 'directions', title: '方向' },
  { component: <SizesDemo />, key: 'sizes', title: '间距大小' },
  { component: <AlignmentDemo />, key: 'alignment', title: '对齐方式' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default demos;
