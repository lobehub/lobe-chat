'use client';

import { Button } from '@lobehub/ui';
import { Divider } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Settings2Icon } from 'lucide-react';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const [agentId, inBoxLoading] = useAgentStore((s) => [
    s.activeAgentId,
    !s.isInboxAgentConfigInit,
  ]);
  const editorData = useStore((s) => s.config.editorData, isEqual);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editorData === undefined) {
      setIsLoading(true || inBoxLoading);
    } else {
      setIsLoading(false || inBoxLoading);
    }
  }, [editorData]);

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

  if (isLoading) return <Loading />;

  return (
    <>
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
