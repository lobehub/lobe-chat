import React from 'react';

import ComponentPlayground, { DemoItem } from '../../../components/Playground';
import { BasicDemo } from '@/components/Switch/demos';

const SWITCH_README = `# Switch 开关

React Native \`Switch\` 的轻封装，内置主题配色（thumb/track）。

## 基础使用

\`@/components\` 提供的 \`Switch\` API 与 React Native 一致：

\`\`\`tsx
import React, { useState } from 'react';
import { Switch } from '@/components';

export default function Demo() {
  const [checked, setChecked] = useState(false);
  return <Switch value={checked} onValueChange={setChecked} />;
}
\`\`\`

## 主题配色
- thumbColor: 使用 \`token.colorTextLightSolid\`
- trackColor: \`false: token.colorBgContainerDisabled\`, \`true: token.colorPrimary\`

如需自定义，仍可传入 React Native \`Switch\` 支持的同名属性覆盖。
`;

const demos: DemoItem[] = [{ component: <BasicDemo />, key: 'basic', title: '基础用法' }];

export default function SwitchPlaygroundPage() {
  return <ComponentPlayground demos={demos} readmeContent={SWITCH_README} />;
}
