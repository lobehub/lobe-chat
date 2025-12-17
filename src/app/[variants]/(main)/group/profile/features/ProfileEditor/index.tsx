'use client';

import { Divider } from 'antd';
import isEqual from 'fast-deep-equal';
import React, { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ModelSelect from '@/features/ModelSelect';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import EditorCanvas from '../EditorCanvas';
import AgentHeader from './AgentHeader';
import AgentTool from './AgentTool';

const ProfileEditor = memo(() => {
  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);
  const updateConfig = useAgentStore((s) => s.updateAgentConfig);

  return (
    <>
      <Flexbox
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        style={{ cursor: 'default', marginBottom: 12 }}
      >
        {/* Header: Avatar + Name + Description */}
        <AgentHeader />
        {/* Config Bar: Model Selector */}
        <Flexbox
          align={'center'}
          gap={8}
          horizontal
          justify={'flex-start'}
          style={{ marginBottom: 12 }}
        >
          <ModelSelect
            onChange={updateConfig}
            value={{
              model: config.model,
              provider: config.provider,
            }}
          />
        </Flexbox>
        <AgentTool />
      </Flexbox>
      <Divider />
      {/* Main Content: Prompt Editor */}
      <EditorCanvas />
    </>
  );
});

export default ProfileEditor;
