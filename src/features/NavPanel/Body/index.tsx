'use client';

import { Accordion } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Agent from './Agent';
import { AgentModalProvider } from './Agent/ModalProvider';
import Repo from './Repo';

export enum GroupKey {
  Agent = 'agent',
  Repo = 'repo',
}

const Body = memo(() => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const content = (
    <>
      <Repo itemKey={GroupKey.Repo} />
      <AgentModalProvider>
        <Agent itemKey={GroupKey.Agent} />
      </AgentModalProvider>
    </>
  );

  if (!expand) {
    return (
      <Flexbox gap={2} paddingInline={8}>
        {content}
      </Flexbox>
    );
  }

  return (
    <Flexbox paddingInline={8}>
      <Accordion defaultExpandedKeys={[GroupKey.Repo, GroupKey.Agent]} gap={8}>
        {content}
      </Accordion>
    </Flexbox>
  );
});

export default Body;
