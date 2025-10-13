import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import BlockDemo from './block';
import DangerDemo from './danger';
import DisabledDemo from './disabled';
import IconDemo from './icon';
import LoadingDemo from './loading';
import ShapeDemo from './shape';
import SizesDemo from './sizes';
import VariantColorDemo from './variant-color';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <DisabledDemo />, key: 'disabled', title: '禁用状态' },
  { component: <BlockDemo />, key: 'block', title: '块级按钮' },
  { component: <IconDemo />, key: 'icon', title: '图标按钮' },
  { component: <ShapeDemo />, key: 'shape', title: '按钮形状' },
  { component: <DangerDemo />, key: 'danger', title: '危险态按钮' },
  { component: <VariantColorDemo />, key: 'variant-color', title: '变体与颜色' },
  { component: <LoadingDemo />, key: 'loading', title: '加载状态' },
];

export default demos;
