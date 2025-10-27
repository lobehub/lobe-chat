import type { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import CompactDemo from './compact';
import FullFeaturedDemo from './fullFeatured';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础高亮' },
  { component: <FullFeaturedDemo />, key: 'full-featured', title: '完整功能' },
  { component: <CompactDemo />, key: 'compact', title: '紧凑型' },
];

export default demos;
