import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import { serverFeatureFlags } from '@/config/featureFlags';

import { PageProps } from '../type';
import Container from './components/Container';
import { Tabs } from './components/Tabs';

export default async (props: PropsWithChildren<PageProps>) => {
  const enableRAGEval = serverFeatureFlags().enableRAGEval;
  const params = await props.params;

  if (!enableRAGEval) return notFound();

  return (
    <Flexbox gap={24} height={'100%'} padding={24} style={{ paddingTop: 0 }}>
      <Tabs knowledgeBaseId={params.id} />
      <Container>{props.children}</Container>
    </Flexbox>
  );
};
