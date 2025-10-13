import { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicHighlighterDemo from './basic';
import CompactHighlighterDemo from './compact';
import FullFeaturedHighlighterDemo from './fullFeatured';
import LanguagesHighlighterDemo from './languages';

const demos: DemoConfig = [
  { component: <BasicHighlighterDemo />, key: 'basic', title: '基础高亮' },
  { component: <FullFeaturedHighlighterDemo />, key: 'fullFeatured', title: '完整功能' },
  { component: <CompactHighlighterDemo />, key: 'compact', title: '紧凑型' },
  { component: <LanguagesHighlighterDemo />, key: 'languages', title: '多语言' },
];

export default demos;
