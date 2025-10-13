import { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import AdvancedDemo from './advanced';
import AvatarsDemo from './avatars';
import BasicDemo from './basic';
import NavigationDemo from './navigation';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AvatarsDemo />, key: 'avatars', title: '头像类型' },
  { component: <NavigationDemo />, key: 'navigation', title: '导航交互' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default demos;
