'use client';

import { Accordion } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SessionHydration from '@/features/NavPanel/SessionHydration';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import Agent from './Agent';
import { AgentModalProvider } from './Agent/ModalProvider';
import BottomMenu from './BottomMenu';
import Repo from './Project';

export enum GroupKey {
  Agent = 'agent',
  Project = 'project',
}

const Body = memo(() => {
  const { enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);
  return (
    <AgentModalProvider>
      <Flexbox paddingInline={4}>
        <Accordion defaultExpandedKeys={[GroupKey.Project, GroupKey.Agent]} gap={8}>
          {enableKnowledgeBase && <Repo itemKey={GroupKey.Project} />}
          <Agent itemKey={GroupKey.Agent} />
          <BottomMenu />
        </Accordion>
      </Flexbox>
      <SessionHydration />
    </AgentModalProvider>
  );
});

export default Body;
