'use client';

import { Accordion } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Agent from './Agent';
import Repo from './Repo';

export enum GroupKey {
  Agent = 'agent',
  Repo = 'repo',
}

const Body = memo(() => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);

  return (
    <Flexbox gap={expand ? undefined : 2} paddingInline={8}>
      <Accordion defaultExpandedKeys={[GroupKey.Repo, GroupKey.Agent]} gap={8}>
        <Repo itemKey={GroupKey.Repo} />
        <Agent itemKey={GroupKey.Agent} />
      </Accordion>
    </Flexbox>
  );
});

export default Body;
