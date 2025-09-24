import { PageContainer } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { AdvancedDemo, AvatarsDemo, BasicDemo, NavigationDemo } from '@/components/ListItem/demos';
import README from '@/components/ListItem/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AvatarsDemo />, key: 'avatars', title: '头像类型' },
  { component: <NavigationDemo />, key: 'navigation', title: '导航交互' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default function ListItemPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="ListItem 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
