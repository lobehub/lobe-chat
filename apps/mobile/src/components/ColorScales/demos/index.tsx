import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import FullDemo from './full';
import TokenDemo from './token';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础演示' },
  { component: <FullDemo />, key: 'full', title: '完整色板' },
  { component: <TokenDemo />, key: 'token', title: 'Token 使用' },
];

export default demos;
