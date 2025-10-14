import { DemoConfig } from '@lobehub/ui-rn';

import AdvancedDemo from './AdvancedDemo';
import BasicDemo from './BasicDemo';
import PositionDemo from './PositionDemo';
import TriggerDemo from './TriggerDemo';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TriggerDemo />, key: 'trigger', title: '触发方式' },
  { component: <PositionDemo />, key: 'position', title: '不同位置' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default demos;
