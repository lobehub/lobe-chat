import { PageContainer } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo, IconsDemo, SizesDemo, ScrollingDemo } from '@/components/CapsuleTabs/demos';
import README from '@/components/CapsuleTabs/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '尺寸大小' },
  { component: <IconsDemo />, key: 'icons', title: '图标组合' },
  { component: <ScrollingDemo />, key: 'scrolling', title: '水平滚动' },
];

export default function CapsuleTabsPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="CapsuleTabs 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
