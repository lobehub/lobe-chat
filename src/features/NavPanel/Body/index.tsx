'use client';

import { Accordion, ScrollShadow } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import Agent from './Agent';
import BottomMenu from './BottomMenu';
import Repo from './Repo';

export enum GroupKey {
  Agent = 'agent',
  Repo = 'repo',
}

const Body = memo(() => {
  const { enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);
  return (
    <ScrollShadow size={2} style={{ height: '100%' }}>
      <Flexbox paddingInline={8}>
        <Accordion defaultExpandedKeys={[GroupKey.Repo, GroupKey.Agent]} gap={8}>
          {enableKnowledgeBase && <Repo itemKey={GroupKey.Repo} />}
          <Agent itemKey={GroupKey.Agent} />
          <BottomMenu />
        </Accordion>
      </Flexbox>
    </ScrollShadow>
  );
});

export default Body;
