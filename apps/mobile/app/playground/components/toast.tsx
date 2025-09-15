import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import {
  AdvancedDemo,
  BasicDemo,
  IntegrationDemo,
  StaticDemo,
  TypesDemo,
} from '@/components/Toast/demos';
import README from '@/components/Toast/readme';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <TypesDemo />, key: 'types', title: '类型演示' },
  { component: <StaticDemo />, key: 'static', title: '静态方法' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
  { component: <IntegrationDemo />, key: 'integration', title: '集成示例' },
];

export default function ToastPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Toast 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
