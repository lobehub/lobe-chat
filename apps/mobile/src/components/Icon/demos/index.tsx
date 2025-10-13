import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import ColorsDemo from './colors';
import SizesDemo from './sizes';
import SpinDemo from './spin';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸' },
  { component: <SpinDemo />, key: 'spin', title: '旋转动画' },
];

export default demos;
