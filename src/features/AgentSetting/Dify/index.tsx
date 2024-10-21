'use client';

import { Form, type ItemGroup, Input } from '@lobehub/ui';
import { Switch } from 'antd';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';

import { useStore } from '../store';
import { useUserStore } from '@/store/user';

const AgentMeta = memo(() => {
  const { t } = useTranslation('setting');

  const [setAgentConfig, agentConfig ] = useStore((s) => [
    s.setAgentConfig,
    s.config
  ]);

  const updateKeyVaultConfig = useUserStore((s)=>s.updateKeyVaultConfig)

  const [difyBaseUrl, setDifyBaseUrl] = useState<string>('https://api.dify.ai/v1')
  const [difyToken, setDifyToken] = useState<string>('app-1WHrUsnegCQqYgSjN952dHyt')
  const [difyUserId, setDifyUserId] = useState<string>('dev')
  const [difyEnabled, setDifyEnable] = useState<boolean>(true)

  useEffect(() => {
    setAgentConfig({
      dify: {
        baseUrl: difyBaseUrl,
        token: difyToken,
        userId: difyUserId,
        enabled: difyEnabled,
      },
      provider: 'dify',
      model: 'Dofy Workflow'
    })
    updateKeyVaultConfig('dify', {
      baseUrl: difyBaseUrl,
      token: difyToken,
      userId: difyUserId,
    })
  }, [difyBaseUrl, difyToken, difyUserId, difyEnabled])

  const metaData: ItemGroup = {
    children: [
      {
        children: (
          <Input 
            onChange={(event) => setDifyBaseUrl(event.currentTarget.value)}
            placeholder='https://api.dify.ai/v1' 
            value={agentConfig.dify.baseUrl} />
        ),
        label: 'BaseUrl'
      },
      {
        children: (
          <Input 
            onChange={(event) => setDifyToken(event.currentTarget.value)} 
            value={agentConfig.dify.token}
            />
        ),
        label: 'Token'
      },
      {
        children: (
          <Input 
            onChange={(event) => setDifyUserId(event.currentTarget.value)} 
            value={agentConfig.dify.userId}
          />
        ),
        label: 'UserId'
      },
      {
        children: (
          <Switch 
            onChange={setDifyEnable}
            value={agentConfig.dify.enabled}
          />
        ),
        label: 'BaseUrl'
      }
    ],
    title: t('settingAgent.title'),
  };

  return <Form items={[metaData]} itemsType={'group'} variant={'pure'} {...FORM_STYLE} />;
});

export default AgentMeta;
