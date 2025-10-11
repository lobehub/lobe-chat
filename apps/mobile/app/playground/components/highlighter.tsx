import { PageContainer } from '@lobehub/ui-rn';
import {
  BasicHighlighterDemo,
  CompactHighlighterDemo,
  FullFeaturedHighlighterDemo,
  LanguagesHighlighterDemo,
} from '@lobehub/ui-rn/Highlighter/demos';
import README from '@lobehub/ui-rn/Highlighter/readme';
import ComponentPlayground, { DemoItem } from '@lobehub/ui-rn/Playground';
import React from 'react';

const demos: DemoItem[] = [
  { component: <BasicHighlighterDemo />, key: 'basic', title: '基础高亮' },
  { component: <FullFeaturedHighlighterDemo />, key: 'fullFeatured', title: '完整功能' },
  { component: <CompactHighlighterDemo />, key: 'compact', title: '紧凑型' },
  { component: <LanguagesHighlighterDemo />, key: 'languages', title: '多语言' },
];

export default function HighlighterPlaygroundPage() {
  return (
    <PageContainer showBack title="Highlighter 组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
