import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import ClosableDemo from './closable';
import CustomDemo from './custom';
import TypesDemo from './types';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TypesDemo />, key: 'types', title: '语义类型' },
  { component: <ClosableDemo />, key: 'closable', title: '可关闭提示' },
  { component: <CustomDemo />, key: 'custom', title: '自定义内容' },
];

export default demos;
