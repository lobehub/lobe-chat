'use client';

import { CheckCircleFilled } from '@ant-design/icons';
import { TraceNameMap } from '@lobechat/types';
import { Alert, Button, Highlighter } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useProviderName } from '@/hooks/useProviderName';
import { chatService } from '@/services/chat';
import { ChatMessageError } from '@/types/message';

interface ConnectionCheckerProps {
  model?: string;
  provider: string;
}

const Error = memo<{ error: ChatMessageError }>(({ error }) => {
  const { t } = useTranslation('error');
  const providerName = useProviderName(error.body?.provider);

  return (
    <Flexbox gap={8} style={{ maxWidth: '600px', width: '100%' }}>
      <Alert
        banner
        extra={
          <Flexbox>
            <Highlighter actionIconSize={'small'} language={'json'} variant={'borderless'}>
              {JSON.stringify(error.body || error, null, 2)}
            </Highlighter>
          </Flexbox>
        }
        message={t(`response.${error.type}` as any, { provider: providerName })}
        showIcon
        type={'error'}
      />
    </Flexbox>
  );
});

const Checker = memo<ConnectionCheckerProps>(({ model, provider }) => {
  const { t } = useTranslation('setting');

  const [loading, setLoading] = useState(false);
  const [pass, setPass] = useState(false);
  // Remove unused setCheckModel state

  const theme = useTheme();
  const [error, setError] = useState<ChatMessageError | undefined>();

  const getFirstAvailableModel = async () => {
    if (model) return model;

    try {
      const response = await fetch(`/webapi/models/${provider}`);
      if (response.ok) {
        const models = await response.json();
        return models.length > 0 ? models[0].id : null;
      }
    } catch (e) {
      console.error('Failed to fetch models:', e);
    }
    return null;
  };

  const checkConnection = async () => {
    let isError = false;
    setError(undefined);
    setPass(false);

    const modelToCheck = await getFirstAvailableModel();
    if (!modelToCheck) {
      setError({
        body: null,
        message: t('response.NoAvailableModels', 'No available models found', { ns: 'error' }),
        type: 'NoAvailableModels',
      });
      setPass(false);
      return;
    }

    // modelToCheck is used directly in the API call below

    await chatService.fetchPresetTaskResult({
      onError: (_, rawError) => {
        setError(rawError);
        setPass(false);
        isError = true;
      },
      onFinish: async (value) => {
        if (!isError && value) {
          setError(undefined);
          setPass(true);
        } else {
          setPass(false);
          setError({
            body: value,
            message: t('response.ConnectionCheckFailed', 'Connection check failed', {
              ns: 'error',
            }),
            type: 'ConnectionCheckFailed',
          });
        }
      },
      onLoadingChange: (loading) => {
        setLoading(loading);
      },
      params: {
        messages: [
          {
            content: '你好',
            role: 'user',
          },
        ],
        model: modelToCheck,
        provider,
      },
      trace: {
        sessionId: `connection:${provider}`,
        topicId: modelToCheck,
        traceName: TraceNameMap.ConnectivityChecker,
      },
    });
  };
  const isMobile = useIsMobile();

  return (
    <Flexbox align={isMobile ? 'flex-start' : 'flex-end'} gap={8}>
      <Flexbox align={'center'} direction={isMobile ? 'horizontal-reverse' : 'horizontal'} gap={12}>
        {pass && (
          <Flexbox gap={4} horizontal>
            <CheckCircleFilled
              style={{
                color: theme.colorSuccess,
              }}
            />
            {t('llm.checker.pass')}
          </Flexbox>
        )}
        <Button loading={loading} onClick={checkConnection}>
          {t('llm.checker.button')}
        </Button>
      </Flexbox>
      {error && <Error error={error} />}
    </Flexbox>
  );
});

export default Checker;
