'use client';

import { Button } from '@lobehub/ui';
import { Divider } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PlayIcon, Settings2Icon } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { useStore } from '@/features/AgentSetting/store';
import ModelSelect from '@/features/ModelSelect';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import EditorCanvas from '../EditorCanvas';
import AgentHeader from './AgentHeader';
import AgentTool from './AgentTool';

const ProfileEditor = memo(() => {
  const theme = useTheme();
  const { t } = useTranslation('setting');
  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);
  const updateConfig = useStore((s) => s.setAgentConfig);
  const agentId = useAgentStore((s) => s.activeAgentId);
  const router = useQueryRoute();

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
        <Flexbox
          align={'center'}
          gap={8}
          horizontal
          justify={'flex-start'}
          style={{ marginTop: 16 }}
        >
          <Button
            icon={PlayIcon}
            onClick={() => {
              if (!agentId) return;
              router.push(urlJoin('/agent', agentId));
            }}
            type={'primary'}
          >
            {t('startConversation')}
          </Button>
        </Flexbox>
      </Flexbox>
      <Divider />
      {/* Main Content: Prompt Editor */}
      <EditorCanvas />
    </>
  );
});

export default ProfileEditor;
