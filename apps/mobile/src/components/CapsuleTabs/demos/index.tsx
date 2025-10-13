import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import IconsDemo from './icons';
import ScrollShadowDemo from './scrollShadow';
import ScrollingDemo from './scrolling';
import SizesDemo from './sizes';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸大小' },
  { component: <IconsDemo />, key: 'icons', title: '图标组合' },
  { component: <ScrollingDemo />, key: 'scrolling', title: '水平滚动' },
  { component: <ScrollShadowDemo />, key: 'scroll-shadow', title: '滚动阴影开关' },
];

export default demos;
