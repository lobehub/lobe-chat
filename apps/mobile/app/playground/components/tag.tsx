import React from 'react';

import { PageContainer } from '@/components';
import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, BorderDemo, ColorsDemo, PresetDemo, UseCaseDemo } from '@/components/Tag/demos';
import README from '@/components/Tag/readme';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ColorsDemo />, key: 'colors', title: '颜色样式' },
  { component: <PresetDemo />, key: 'preset', title: '预设颜色' },
  { component: <BorderDemo />, key: 'border', title: '无边框' },
  { component: <UseCaseDemo />, key: 'usecase', title: '实际应用' },
];

export default function TagPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="Tag 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
