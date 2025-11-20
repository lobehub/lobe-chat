'use client';

import { Accordion, ScrollShadow } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Agent from './Agent';
import Repo from './Repo';

export enum GroupKey {
  Agent = 'agent',
  Repo = 'repo',
}

const Body = memo(() => {
  return (
    <ScrollShadow size={2} style={{ height: '100%' }}>
      <Flexbox paddingInline={8}>
        <Accordion defaultExpandedKeys={[GroupKey.Repo, GroupKey.Agent]} gap={8}>
          <Repo itemKey={GroupKey.Repo} />
          <Agent itemKey={GroupKey.Agent} />
        </Accordion>
      </Flexbox>
    </ScrollShadow>
  );
});

export default Body;
