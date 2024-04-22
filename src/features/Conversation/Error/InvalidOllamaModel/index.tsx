import { Ollama } from '@lobehub/icons';
import { Button, Input, Progress } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import { ollamaService } from '@/services/ollama';
import { useChatStore } from '@/store/chat';

import { ErrorActionContainer, FormAction } from '../style';
import { formatSize, useDownloadMonitor } from './useDownloadMonitor';

interface OllamaModelFormProps {
  id: string;
  model: string;
}

const OllamaModelForm = memo<OllamaModelFormProps>(({ id, model }) => {
  const { t } = useTranslation('error');
  const { t: settingT } = useTranslation('setting');

  const [modelToPull, setModelToPull] = useState(model);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const { remainingTime, downloadSpeed } = useDownloadMonitor(total, completed);
  const percent = useMemo(() => {
    return total ? Number(((completed / total) * 100).toFixed(0)) : 0;
  }, [completed, total]);

  const [delAndRegenerateMessage, deleteMessage] = useChatStore((s) => [
    s.delAndRegenerateMessage,
    s.deleteMessage,
  ]);
  const theme = useTheme();

  const { mutate, isLoading: isDownloading } = useSWR(
    [id, modelToPull],
    async ([, model]) => {
      const generator = await ollamaService.pullModel(model);
      for await (const progress of generator) {
        if (progress.completed) {
          setCompleted(progress.completed);
          setTotal(progress.total);
        }
      }
      return null;
    },
    {
      onSuccess: () => {
        delAndRegenerateMessage(id);
      },
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  );

  return (
    <Center gap={16} style={{ maxWidth: 300, width: '100%' }}>
      <FormAction
        avatar={<Ollama color={theme.colorPrimary} size={64} />}
        description={
          isDownloading ? settingT('ollama.download.desc') : t('unlock.ollama.description')
        }
        title={
          isDownloading
            ? settingT('ollama.download.title', { model: modelToPull })
            : t('unlock.ollama.title')
        }
      >
        {!isDownloading && (
          <Input
            onChange={(e) => {
              setModelToPull(e.target.value);
            }}
            value={modelToPull}
          />
        )}
      </FormAction>
      {isDownloading && (
        <Flexbox flex={1} gap={8} width={'100%'}>
          <Progress
            percent={percent}
            showInfo
            strokeColor={theme.colorSuccess}
            trailColor={theme.colorSuccessBg}
          />
          <Flexbox
            distribution={'space-between'}
            horizontal
            style={{ color: theme.colorTextDescription, fontSize: 12 }}
          >
            <span>
              {settingT('ollama.download.remainingTime')}: {remainingTime}
            </span>
            <span>
              {settingT('ollama.download.speed')}: {downloadSpeed}
            </span>
          </Flexbox>
        </Flexbox>
      )}
      <Flexbox gap={12} width={'100%'}>
        <Button
          block
          loading={isDownloading}
          onClick={() => {
            mutate();
          }}
          style={{ marginTop: 8 }}
          type={'primary'}
        >
          {!isDownloading
            ? t('unlock.ollama.confirm')
            : // if total is 0, show starting, else show downloaded
              !total
              ? t('unlock.ollama.starting')
              : t('unlock.ollama.downloaded', {
                  completed: formatSize(completed),
                  total: formatSize(total),
                })}
        </Button>
        {isDownloading ? (
          <Button
            onClick={() => {
              ollamaService.abort();
            }}
          >
            {t('unlock.ollama.cancel')}
          </Button>
        ) : (
          <Button
            onClick={() => {
              deleteMessage(id);
            }}
          >
            {t('unlock.closeMessage')}
          </Button>
        )}
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
