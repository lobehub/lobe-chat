import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import CombinationDemo from './combination';
import EllipsisDemo from './ellipsis';
import HeadingDemo from './heading';
import SemanticDemo from './semantic';
import StylingDemo from './styling';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <HeadingDemo />, key: 'heading', title: '标题' },
  { component: <SemanticDemo />, key: 'semantic', title: '语义化类型' },
  { component: <StylingDemo />, key: 'styling', title: '自定义样式' },
  { component: <EllipsisDemo />, key: 'ellipsis', title: '省略号' },
  { component: <CombinationDemo />, key: 'combination', title: '组合使用' },
];

export default demos;
