import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import SizesDemo from './sizes';
import VariantsDemo from './variants';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <VariantsDemo />, key: 'variants', title: '文件类型示例' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
];

export default demos;
