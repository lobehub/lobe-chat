import React from 'react';

import { PageContainer } from '@/components';
import { BasicDemo, IconsDemo, ScrollingDemo, SizesDemo } from '@/components/CapsuleTabs/demos';
import README from '@/components/CapsuleTabs/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

import { useStyles } from './style';

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
