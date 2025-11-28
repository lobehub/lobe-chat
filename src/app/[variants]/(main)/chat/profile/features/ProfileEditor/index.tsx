'use client';

import { Divider } from 'antd';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import { useAgentStore } from '@/store/agent';

import AgentSettings from '../../Settings/features/AgentSettings';
import AgentConfigBar from './AgentConfigBar';
import AgentHeader from './AgentHeader';
import EditorCanvas from './EditorCanvas';

const ProfileEditor = memo(() => {
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [agentId, isLoading] = useAgentStore((s) => [s.activeAgentId, !s.isInboxAgentConfigInit]);

  return (
    <>
      {isLoading ? (
        <Flexbox align="center" height="100vh" justify="center">
          <Loading />
        </Flexbox>
      ) : (
        <>
          {/* Header: Avatar + Name + Description */}
          <AgentHeader />
          {/* Config Bar: Model Selector + Settings Button */}
          <AgentConfigBar onOpenSettings={() => setShowSettingsDrawer(true)} />
          <Divider />
          {/* Main Content: Prompt Editor */}
          <EditorCanvas />
        </>
      )}

      {/* Legacy AgentSettings Drawer (opened via Settings button) */}
      <AgentSettings
        agentId={agentId}
        onClose={() => setShowSettingsDrawer(false)}
        open={showSettingsDrawer}
      />
    </>
  );
});

export default ProfileEditor;
