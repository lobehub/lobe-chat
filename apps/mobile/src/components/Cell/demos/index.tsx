import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import WithExtraDemo from './with-extra';
import WithIconDemo from './with-icon';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <WithIconDemo />, key: 'with-icon', title: '带图标' },
  { component: <WithExtraDemo />, key: 'with-extra', title: '额外内容' },
];

export default demos;
