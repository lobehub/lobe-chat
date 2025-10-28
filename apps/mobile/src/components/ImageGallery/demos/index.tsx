import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import ManagerDemo from './manager';
import MultipleDemo from './multiple';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <MultipleDemo />, key: 'multiple', title: '多图浏览' },
  { component: <ManagerDemo />, key: 'manager', title: '使用管理器' },
];

export default demos;
