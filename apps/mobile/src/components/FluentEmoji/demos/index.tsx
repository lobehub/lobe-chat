import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import ComparisonDemo from './comparison';
import SizesDemo from './sizes';
import TypeDemo from './type';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <ComparisonDemo />, key: 'comparison', title: '3D vs 原始' },
  { component: <TypeDemo />, key: 'type', title: '不同类型' },
];

export default demos;
