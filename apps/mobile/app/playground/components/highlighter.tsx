import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components';
import { useStyles } from './style';

import React from 'react';

import ComponentPlayground, { DemoItem } from '@/components/Playground';
import {
  BasicHighlighterDemo,
  CompactHighlighterDemo,
  FullFeaturedHighlighterDemo,
  LanguagesHighlighterDemo,
} from '@/components/Highlighter/demos';
import README from '@/components/Highlighter/readme';

const demos: DemoItem[] = [
  { component: <BasicHighlighterDemo />, key: 'basic', title: '基础高亮' },
  { component: <FullFeaturedHighlighterDemo />, key: 'fullFeatured', title: '完整功能' },
  { component: <CompactHighlighterDemo />, key: 'compact', title: '紧凑型' },
  { component: <LanguagesHighlighterDemo />, key: 'languages', title: '多语言' },
];

export default function HighlighterPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="Highlighter 组件" />
      <ComponentPlayground demos={demos} readmeContent={README} />
    </SafeAreaView>
  );
}
