'use client';

import { CheckCircleFilled } from '@ant-design/icons';
import { ModelIcon } from '@lobehub/icons';
import { Alert, Highlighter, Icon } from '@lobehub/ui';
import { Button, Select, Space } from 'antd';
import { useTheme } from 'antd-style';
import { Loader2Icon } from 'lucide-react';
import { ReactNode, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { TraceNameMap } from '@/const/trace';
import { useProviderName } from '@/hooks/useProviderName';
import { chatService } from '@/services/chat';
import { aiModelSelectors, aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { ChatMessageError } from '@/types/message';

const Error = memo<{ error: ChatMessageError }>(({ error }) => {
  const { t } = useTranslation('error');
  const providerName = useProviderName(error.body?.provider);

  return (
    <Flexbox gap={8} style={{ width: '100%' }}>
      <Alert
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

export type CheckErrorRender = (props: {
  defaultError: ReactNode;
  error?: ChatMessageError;
  setError: (error?: ChatMessageError) => void;
}) => ReactNode;

interface ConnectionCheckerProps {
  checkErrorRender?: CheckErrorRender;
  model: string;
  provider: string;
}

const Checker = memo<ConnectionCheckerProps>(
  ({ model, provider, checkErrorRender: CheckErrorRender }) => {
    const { t } = useTranslation('setting');

    const isProviderConfigUpdating = useAiInfraStore(
      aiProviderSelectors.isProviderConfigUpdating(provider),
    );
    const totalModels = useAiInfraStore(aiModelSelectors.aiProviderChatModelListIds);
    const updateAiProviderConfig = useAiInfraStore((s) => s.updateAiProviderConfig);

    const [loading, setLoading] = useState(false);
    const [pass, setPass] = useState(false);
    const [checkModel, setCheckModel] = useState(model);

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
              content: 'hello',
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

    const defaultError = error ? <Error error={error as ChatMessageError} /> : null;

    const errorContent = CheckErrorRender ? (
      <CheckErrorRender defaultError={defaultError} error={error} setError={setError} />
    ) : (
      defaultError
    );

    return (
      <Flexbox gap={8}>
        <Space.Compact block>
          <Select
            listItemHeight={36}
            onSelect={async (value) => {
              setCheckModel(value);
              await updateAiProviderConfig(provider, { checkModel: value });
            }}
            optionRender={({ value }) => {
              return (
                <Flexbox align={'center'} gap={6} horizontal>
                  <ModelIcon model={value as string} size={20} />
                  {value}
                </Flexbox>
              );
            }}
            options={totalModels.map((id) => ({ label: id, value: id }))}
            suffixIcon={isProviderConfigUpdating && <Icon icon={Loader2Icon} spin />}
            value={checkModel}
            virtual
          />
          <Button disabled={isProviderConfigUpdating} loading={loading} onClick={checkConnection}>
            {t('llm.checker.button')}
          </Button>
        </Space.Compact>

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
        {error && errorContent}
      </Flexbox>
    );
  },
);

export default Checker;
