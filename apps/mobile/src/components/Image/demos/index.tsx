import React from 'react';

import type { DemoConfig } from '@/components/types';

import BasicDemo from './basic';
import FallbackDemo from './fallback';
import PreviewGroupDemo from './previewGroup';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <PreviewGroupDemo />, key: 'preview-group', title: '预览组' },
  { component: <FallbackDemo />, key: 'fallback', title: '加载失败占位图' },
];

export default demos;
