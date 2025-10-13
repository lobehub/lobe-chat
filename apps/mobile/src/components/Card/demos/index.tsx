import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import WithCoverDemo from './with-cover';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础卡片' },
  { component: <WithCoverDemo />, key: 'with-cover', title: '带封面卡片' },
];

export default demos;
