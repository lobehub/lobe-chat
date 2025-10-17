import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  //
  // { component: <CustomColumnsDemo />, key: 'custom-columns', title: '自定义列数' },
  // { component: <MinimalDemo />, key: 'minimal', title: '最小化 UI' },
  // { component: <FilteredDemo />, key: 'filtered', title: '过滤 Emoji' },
];

export default demos;
