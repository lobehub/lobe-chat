import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import CustomDemo from './custom';
import GroupDemo from './group';
import VerticalDemo from './vertical';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <VerticalDemo />, key: 'vertical', title: '垂直分割线' },
  { component: <GroupDemo />, key: 'group', title: '内容分组' },
  { component: <CustomDemo />, key: 'custom', title: '自定义样式' },
];

export default demos;
