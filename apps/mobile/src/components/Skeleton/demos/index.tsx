import { DemoConfig } from '@lobehub/ui-rn';

import AnimatedDemo from './animated';
import AvatarDemo from './avatar';
import BasicDemo from './basic';
import ComplexDemo from './complex';
import CompoundDemo from './compound';
import ParagraphDemo from './paragraph';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AnimatedDemo />, key: 'animated', title: '动画效果' },
  { component: <AvatarDemo />, key: 'avatar', title: '头像骨架屏' },
  { component: <ParagraphDemo />, key: 'paragraph', title: '段落骨架屏' },
  { component: <CompoundDemo />, key: 'compound', title: '复合组件' },
  { component: <ComplexDemo />, key: 'complex', title: '复杂示例' },
];

export default demos;
