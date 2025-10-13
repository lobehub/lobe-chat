import { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import ColorsDemo from './colors';
import DisabledDemo from './disabled';
import LoadingDemo from './loading';
import SizesDemo from './sizes';
import VariantsDemo from './variants';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色' },
  { component: <VariantsDemo />, key: 'variants', title: '不同视觉风格' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸' },
  { component: <LoadingDemo />, key: 'loading', title: '加载状态' },
  { component: <DisabledDemo />, key: 'disabled', title: '禁用状态' },
];

export default demos;
