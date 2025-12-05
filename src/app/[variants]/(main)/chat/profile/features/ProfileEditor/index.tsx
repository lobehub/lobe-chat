'use client';

import { Button } from '@lobehub/ui';
import { Divider } from 'antd';
import { useTheme } from 'antd-style';
import { Settings2Icon } from 'lucide-react';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import { useStore } from '@/features/AgentSetting/store';
import ModelSelect from '@/features/ModelSelect';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import AgentSettings from '../../Settings/features/AgentSettings';
import AgentHeader from './AgentHeader';
import AgentTool from './AgentTool';
import EditorCanvas from './EditorCanvas';

const ProfileEditor = memo(() => {
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [agentId, isLoadingConfig] = useAgentStore((s) => [
    s.activeAgentId,
    agentSelectors.isAgentConfigLoading(s),
  ]);

  const theme = useTheme();
  const { t } = useTranslation('setting');
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

  if (isLoadingConfig) return <Loading />;

  return (
    <Flexbox flex={1} style={{ overflowY: 'auto' }}>
      {/* Header: Avatar + Name + Description */}
      <AgentHeader />
      {/* Config Bar: Model Selector + Settings Button */}
      <Flexbox
        align={'center'}
        gap={8}
        horizontal
        justify={'flex-start'}
        style={{ marginBottom: 12 }}
      >
        <Flexbox align={'center'} gap={8} horizontal>
          <ModelSelect onChange={handleModelChange} value={modelValue} />
          <Button
            icon={Settings2Icon}
            onClick={() => setShowSettingsDrawer(true)}
            size={'small'}
            style={{ color: theme.colorTextSecondary }}
            type={'text'}
          >
            {t('advancedSettings')}
          </Button>
        </Flexbox>
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
    </Flexbox>
  );
});

export default ProfileEditor;
