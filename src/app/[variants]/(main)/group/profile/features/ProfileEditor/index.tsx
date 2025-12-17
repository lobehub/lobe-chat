'use client';

import { Button } from '@lobehub/ui';
import { Divider } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Settings2Icon } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelSelect from '@/features/ModelSelect';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import AgentSettings from '../AgentSettings';
import EditorCanvas from '../EditorCanvas';
import AgentHeader from './AgentHeader';
import AgentTool from './AgentTool';

const ProfileEditor = memo(() => {
  const theme = useTheme();
  const { t } = useTranslation('setting');
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
              onChange={updateConfig}
              value={{
                model: config.model,
                provider: config.provider,
              }}
            />
            <Button
              icon={Settings2Icon}
              onClick={() => useAgentStore.setState({ showAgentSetting: true })}
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
      <AgentSettings />
    </>
  );
});

export default ProfileEditor;
