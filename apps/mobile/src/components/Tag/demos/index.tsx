import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import BorderDemo from './border';
import ColorsDemo from './colors';
import PresetDemo from './preset';
import UseCaseDemo from './usecase';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色样式' },
  { component: <PresetDemo />, key: 'preset', title: '预设颜色' },
  { component: <BorderDemo />, key: 'border', title: '无边框' },
  { component: <UseCaseDemo />, key: 'usecase', title: '实际应用' },
];

export default demos;
