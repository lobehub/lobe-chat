import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import ExtraDemo from './extra';
import LoadingDemo from './loading';
import TypesDemo from './types';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TypesDemo />, key: 'types', title: '不同风格' },
  { component: <ExtraDemo />, key: 'extra', title: '带附加文字' },
  { component: <LoadingDemo />, key: 'loading', title: '加载动画' },
];

export default demos;
