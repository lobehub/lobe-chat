import React from 'react';

import { PageContainer } from '@/components';
import {
  alignment as AlignmentDemo,
  basic as BasicDemo,
  example as ExampleDemo,
  wrap as WrapDemo,
} from '@/components/FlexBox/demos';
import README from '@/components/FlexBox/readme';
import ComponentPlayground, { DemoItem } from '@/components/Playground';

import { useStyles } from './style';

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AlignmentDemo />, key: 'alignment', title: '对齐方式' },
  { component: <WrapDemo />, key: 'wrap', title: '换行和Flex' },
  { component: <ExampleDemo />, key: 'example', title: '组合示例' },
];

export default function FlexBoxPlaygroundPage() {
  const { styles } = useStyles();
  return (
    <PageContainer showBack style={styles.safeAreaView} title="Center 居中组件">
      <ComponentPlayground demos={demos} readmeContent={README} />
    </PageContainer>
  );
}
