import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import AnimationDemo from './animation';
import BasicDemo from './basic';
import BlockDemo from './block';
import ControlledDemo from './controlled';
import CustomDemo from './custom';
import DisabledDemo from './disabled';
import IconDemo from './icon';
import ShapesDemo from './shapes';
import SizesDemo from './sizes';
import VerticalDemo from './vertical';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AnimationDemo />, key: 'animation', title: '动画效果' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <ShapesDemo />, key: 'shapes', title: '不同形状' },
  { component: <IconDemo />, key: 'icon', title: '图标' },
  { component: <VerticalDemo />, key: 'vertical', title: '垂直排列' },
  { component: <DisabledDemo />, key: 'disabled', title: '禁用状态' },
  { component: <BlockDemo />, key: 'block', title: '块级元素' },
  { component: <CustomDemo />, key: 'custom', title: '自定义选项' },
  { component: <ControlledDemo />, key: 'controlled', title: '受控模式' },
];

export default demos;
