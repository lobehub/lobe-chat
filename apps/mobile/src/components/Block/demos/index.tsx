import { DemoConfig } from '@lobehub/ui-rn';

import ActiveDemo from './active';
import BasicDemo from './basic';
import LayoutDemo from './layout';
import ClickableDemo from './pressEffect';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ActiveDemo />, key: 'active', title: '激活态' },
  { component: <ClickableDemo />, key: 'pressEffect', title: '可点击状态' },
  { component: <LayoutDemo />, key: 'layout', title: '布局示例' },
];

export default demos;
