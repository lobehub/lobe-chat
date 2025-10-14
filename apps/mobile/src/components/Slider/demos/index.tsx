import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import ControlledDemo from './controlled';
import MarksDemo from './marks';
import RangeDemo from './range';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <RangeDemo />, key: 'range', title: '不同范围' },
  { component: <ControlledDemo />, key: 'controlled', title: '受控模式' },
  { component: <MarksDemo />, key: 'marks', title: '刻度标记' },
];

export default demos;
