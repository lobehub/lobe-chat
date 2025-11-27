'use client';

import { ActionIcon } from '@lobehub/ui';
import { Divider } from 'antd';
import { Settings } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import { useStore } from '@/features/AgentSetting/store';
import ModelSelect from '@/features/ModelSelect';
import { useAgentStore } from '@/store/agent';

import AgentSettings from '../../Settings/features/AgentSettings';
import AgentHeader from './AgentHeader';
import AgentTool from './AgentTool';
import EditorCanvas from './EditorCanvas';

const ProfileEditor = memo(() => {
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [agentId, isLoading] = useAgentStore((s) => [s.activeAgentId, !s.isInboxAgentConfigInit]);

  const config = useStore((s) => s.config);
  const [modelValue, setModelValue] = useState({
    model: config.model,
    provider: config.provider,
  });
  const updateConfig = useStore((s) => s.setAgentConfig);

  const handleModelChange = useMemo(() => {
    return ({ model, provider }: { model: string; provider: string }) => {
      setModelValue({ model, provider });
      updateConfig({ model, provider });
    };
  }, [updateConfig]);

  if (isLoading) return <Loading />;

  return (
    <>
      {/* Header: Avatar + Name + Description */}
      <AgentHeader />
      {/* Config Bar: Model Selector + Settings Button */}
      <Flexbox gap={4} horizontal justify={'flex-start'}>
        <ModelSelect onChange={handleModelChange} value={modelValue} />
        <ActionIcon
          icon={Settings}
          onClick={() => setShowSettingsDrawer(true)}
          title="Advanced Settings"
        />
      </Flexbox>
      <AgentTool />
      <Divider />
      {/* Main Content: Prompt Editor */}
      <EditorCanvas />
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
