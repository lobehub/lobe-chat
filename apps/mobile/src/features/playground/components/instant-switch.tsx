import React from 'react';

import ComponentPlayground, { DemoItem } from '../../../components/Playground';
import { BasicDemo, SizesDemo, StatesDemo } from '@/components/InstantSwitch/demos';

const INSTANT_SWITCH_README = `# InstantSwitch 即时开关组件

React Native版本的即时开关组件，支持异步切换操作，参考web端InstantSwitch实现。

## 功能特性

- ✅ 异步切换操作支持
- ✅ Loading状态管理
- ✅ 乐观更新机制
- ✅ 错误处理和回滚
- ✅ 防重复点击
- ✅ 三种尺寸支持
- ✅ 自定义颜色
- ✅ 禁用状态支持
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import InstantSwitch from '@/components/InstantSwitch';

// 基础用法
<InstantSwitch
  enabled={enabled}
  onChange={async (enabled) => {
    // 异步操作
    await toggleProvider(id, enabled);
  }}
/>

// 自定义颜色
<InstantSwitch
  enabled={enabled}
  onChange={handleChange}
  trackColor={{
    false: '#ff6b6b',
    true: '#51cf66',    
  }}
  thumbColor="#ffffff"
  loadingColor="#339af0"
/>

// 不同尺寸
<InstantSwitch size="small" />
<InstantSwitch size="default" />
<InstantSwitch size="large" />

// 禁用状态
<InstantSwitch disabled />
\`\`\`

## API

### InstantSwitchProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| enabled | \`boolean\` | - | 当前开关状态 |
| onChange | \`(enabled: boolean) => Promise<void>\` | - | 异步切换回调 |
| size | \`'small' \\| 'default' \\| 'large'\` | \`'default'\` | 开关尺寸 |
| disabled | \`boolean\` | \`false\` | 是否禁用 |
| trackColor | \`{ false: string; true: string }\` | - | 轨道颜色 |
| thumbColor | \`string\` | - | 滑块颜色 |
| loadingColor | \`string\` | - | Loading颜色 |
| style | \`ViewStyle\` | - | 容器样式 |
| trackStyle | \`ViewStyle\` | - | 轨道样式 |
| thumbStyle | \`ViewStyle\` | - | 滑块样式 |

## 核心特性

### 异步操作处理

InstantSwitch专门为异步操作设计，支持：
- 异步切换回调
- Loading状态显示
- 乐观更新机制
- 错误回滚处理

### 乐观更新

组件采用乐观更新策略：
1. 用户点击后立即更新UI状态
2. 后台执行异步操作
3. 操作成功保持新状态
4. 操作失败回滚到原状态

### 防重复点击

在异步操作进行中，组件会：
- 禁用开关操作
- 显示Loading指示器
- 防止重复触发

## 尺寸规格

- \`small\`: 小尺寸（缩放0.8）
- \`default\`: 默认尺寸（缩放1.0）
- \`large\`: 大尺寸（缩放1.2）

## 使用场景

- 提供商启用/禁用
- 功能开关控制
- 设置项切换
- 需要异步确认的操作
`;

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <StatesDemo />, key: 'states', title: '状态演示' },
];

export default function InstantSwitchPlaygroundPage() {
  return <ComponentPlayground demos={demos} readmeContent={INSTANT_SWITCH_README} />;
}
