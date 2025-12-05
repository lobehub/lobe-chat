'use client';

import { Button } from '@lobehub/ui';
import { Divider } from 'antd';
import { useTheme } from 'antd-style';
import { Settings2Icon } from 'lucide-react';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useStore } from '@/features/AgentSetting/store';
import ModelSelect from '@/features/ModelSelect';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import AgentSettings from '../../Settings/features/AgentSettings';
import EditorCanvas from '../EditorCanvas';
import AgentHeader from './AgentHeader';
import AgentTool from './AgentTool';

const ProfileEditor = memo(() => {
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [agentId] = useAgentStore((s) => [s.activeAgentId]);

  const theme = useTheme();
  const { t } = useTranslation('setting');

  const config = useAgentStore(agentSelectors.currentAgentConfig);

  const updateConfig = useStore((s) => s.setAgentConfig);

  const handleModelChange = useMemo(() => {
    return ({ model, provider }: { model: string; provider: string }) => {
      updateConfig({ model, provider });
    };
  }, [updateConfig]);

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
        {/* Config Bar: Model Selector + Settings Button */}
        <Flexbox
          align={'center'}
          gap={8}
          horizontal
          justify={'flex-start'}
          style={{ marginBottom: 12 }}
        >
          <Flexbox align={'center'} gap={8} horizontal>
            <ModelSelect
              onChange={handleModelChange}
              value={{
                model: config.model,
                provider: config.provider,
              }}
            />
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
      </Flexbox>
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
