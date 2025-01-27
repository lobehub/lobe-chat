'use client';

import { CheckCircleFilled } from '@ant-design/icons';
import { Alert, Highlighter } from '@lobehub/ui';
import { Button } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { TraceNameMap } from '@/const/trace';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useProviderName } from '@/hooks/useProviderName';
import { chatService } from '@/services/chat';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { ChatMessageError } from '@/types/message';

const Error = memo<{ error: ChatMessageError }>(({ error }) => {
  const { t } = useTranslation('error');
  const providerName = useProviderName(error.body?.provider);

  return (
    <Flexbox gap={8} style={{ maxWidth: '600px', width: '100%' }}>
      <Alert
        banner
        extra={
          <Flexbox>
            <Highlighter copyButtonSize={'small'} language={'json'} type={'pure'}>
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

interface ConnectionCheckerProps {
  model: string;
  provider: string;
}

const Checker = memo<ConnectionCheckerProps>(({ model, provider }) => {
  const { t } = useTranslation('setting');

  const disabled = useAiInfraStore(aiProviderSelectors.isProviderConfigUpdating(provider));

  const [loading, setLoading] = useState(false);
  const [pass, setPass] = useState(false);

  const theme = useTheme();
  const [error, setError] = useState<ChatMessageError | undefined>();

  const checkConnection = async () => {
    let isError = false;

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
            message: t('response.ConnectionCheckFailed', { ns: 'error' }),
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
        model,
        provider,
      },
      trace: {
        sessionId: `connection:${provider}`,
        topicId: model,
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
        <Button disabled={disabled} loading={loading} onClick={checkConnection}>
          {t('llm.checker.button')}
        </Button>
      </Flexbox>
      {error && <Error error={error} />}
    </Flexbox>
  );
});

export default Checker;
