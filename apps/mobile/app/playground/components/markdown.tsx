import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import { BasicDemo } from '@/components/Markdown/demos';
import README from '@/components/Markdown/readme';

const demos: DemoItem[] = [{ component: <BasicDemo />, key: 'basic', title: '基础用法' }];

export default function MarkdownPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Markdown 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
