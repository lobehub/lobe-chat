import { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import AdvancedDemo from './advanced';
import BasicDemo from './basic';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础演示' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级演示' },
];

export default demos;
