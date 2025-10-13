import { DemoConfig } from '@lobehub/ui-rn';
import React from 'react';

import BasicDemo from './basic';
import CompoundDemo from './compound';
import PasswordDemo from './password';
import PrefixDemo from './prefix';
import SearchDemo from './search';
import SizesDemo from './sizes';
import SuffixDemo from './suffix';
import TextAreaDemo from './textarea';
import VariantDemo from './variant';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <PrefixDemo />, key: 'prefix', title: '带前缀' },
  { component: <SuffixDemo />, key: 'suffix', title: '带后缀' },
  { component: <SearchDemo />, key: 'search', title: '搜索输入框' },
  { component: <PasswordDemo />, key: 'password', title: '密码输入框' },
  { component: <CompoundDemo />, key: 'compound', title: '复合组件' },
  { component: <VariantDemo />, key: 'variant', title: '外观变体' },
  { component: <TextAreaDemo />, key: 'textarea', title: '多行文本（autoSize）' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸大小' },
];

export default demos;
