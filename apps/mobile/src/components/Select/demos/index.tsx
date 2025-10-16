import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import CustomDemo from './custom';
import DisabledDemo from './disabled';
import SizesDemo from './sizes';
import VariantsDemo from './variants';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <VariantsDemo />, key: 'variants', title: '不同变体' },
  { component: <DisabledDemo />, key: 'disabled', title: '禁用状态' },
  { component: <CustomDemo />, key: 'custom', title: '自定义渲染' },
];

export default demos;
