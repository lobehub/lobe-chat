import { Ollama } from '@lobehub/icons';
import { Button, Input, Progress } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import { ollamaService } from '@/services/ollama';
import { useChatStore } from '@/store/chat';

import { ErrorActionContainer, FormAction } from './style';

interface OllamaModelFormProps {
  id: string;
  model: string;
}

const OllamaModelForm = memo<OllamaModelFormProps>(({ id, model }) => {
  const { t } = useTranslation('error');
  const [modelToPull, setModelToPull] = useState(model);
  const [percent, setPercent] = useState(0);

  const [resendMessage, deleteMessage] = useChatStore((s) => [s.resendMessage, s.deleteMessage]);
  const theme = useTheme();

  const { mutate, isLoading } = useSWR(
    [id, modelToPull],
    async ([, model]) => {
      const generator = await ollamaService.pullModel(model);
      for await (const progress of generator) {
        setPercent(
          progress?.total ? Number(((progress.completed / progress.total) * 100).toFixed(0)) : 0,
        );
      }
      return null;
    },
    {
      onSuccess: () => {
        resendMessage(id);
        deleteMessage(id);
      },
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  );

  return (
    <Center gap={16} style={{ maxWidth: 300 }}>
      <FormAction
        avatar={<Ollama color={theme.colorPrimary} size={64} />}
        description={t('unlock.model.Ollama.description')}
        title={t('unlock.model.Ollama.title')}
      >
        <Input
          disabled={isLoading}
          onChange={(e) => {
            setModelToPull(e.target.value);
          }}
          value={modelToPull}
        />
      </FormAction>
      {isLoading && (
        <Progress
          percent={percent}
          showInfo
          strokeColor={theme.colorSuccess}
          trailColor={theme.colorSuccessBg}
        />
      )}
      <Flexbox gap={12} width={'100%'}>
        <Button
          block
          loading={isLoading}
          onClick={() => {
            mutate();
          }}
          style={{ marginTop: 8 }}
          type={'primary'}
        >
          {t('unlock.model.Ollama.confirm')}
        </Button>
        <Button
          onClick={() => {
            deleteMessage(id);
          }}
        >
          {t('unlock.closeMessage')}
        </Button>
      </Flexbox>
    </Center>
  );
});

interface InvalidOllamaModelProps {
  id: string;
  model: string;
}

const InvalidOllamaModel = memo<InvalidOllamaModelProps>(({ id, model }) => (
  <ErrorActionContainer>
    <OllamaModelForm id={id} model={model} />
  </ErrorActionContainer>
));

export default InvalidOllamaModel;
