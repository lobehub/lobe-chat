import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import ActionDemo from './action';
import BasicDemo from './basic';
import CustomDemo from './custom';
import IconDemo from './icon';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <IconDemo />, key: 'icon', title: '自定义图标' },
  { component: <CustomDemo />, key: 'custom', title: '自定义描述' },
  { component: <ActionDemo />, key: 'action', title: '带操作按钮' },
];

export default demos;
