import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';

import { serverFeatureFlags } from '@/config/featureFlags';

import Container from './components/Container';
import { Tabs } from './components/Tabs';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

const Layout = async (props: LayoutProps) => {
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

export default Layout;
