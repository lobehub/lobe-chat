import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import ColorsDemo from './colors';
import SizesDemo from './sizes';
import VariantsDemo from './variants';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <VariantsDemo />, key: 'variants', title: '动画变体' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸变化' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色变化' },
];

export default demos;
