import { DemoConfig } from '@lobehub/ui-rn';

import BasicDemo from './basic';
import BorderDemo from './border';
import ColorsDemo from './colors';
import HexColorDemo from './hexColor';
import PresetDemo from './preset';
import SizesDemo from './sizes';
import UseCaseDemo from './usecase';
import VariantsDemo from './variants';
import WithIconDemo from './withIcon';

const demos: DemoConfig = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <VariantsDemo />, key: 'variants', title: '样式变体' },
  { component: <ColorsDemo />, key: 'colors', title: '预设颜色' },
  { component: <PresetDemo />, key: 'preset', title: '系统状态颜色' },
  { component: <HexColorDemo />, key: 'hex-color', title: 'Hex 颜色值' },
  { component: <BorderDemo />, key: 'border', title: '无边框样式' },
  { component: <WithIconDemo />, key: 'with-icon', title: '带图标' },
  { component: <UseCaseDemo />, key: 'usecase', title: '实际应用场景' },
];

export default demos;
