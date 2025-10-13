import { DemoConfig } from '@lobehub/ui-rn';

import AdvancedDemo from './advanced';
import BasicDemo from './basic';
import IntegrationDemo from './integration';
import StaticDemo from './static';
import TypesDemo from './types';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TypesDemo />, key: 'types', title: '类型演示' },
  { component: <StaticDemo />, key: 'static', title: '静态方法' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
  { component: <IntegrationDemo />, key: 'integration', title: '集成示例' },
];

export default demos;
