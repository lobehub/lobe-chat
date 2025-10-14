import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import BordersDemo from './borders';
import ErrorDemo from './error';
import SizesDemo from './sizes';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <BordersDemo />, key: 'borders', title: '边框样式' },
  { component: <ErrorDemo />, key: 'error', title: '错误处理' },
];

export default demos;
