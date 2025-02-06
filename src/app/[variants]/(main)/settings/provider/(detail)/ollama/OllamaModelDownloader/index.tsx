import { Ollama } from '@lobehub/icons';
import { Button, Input, Progress } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import FormAction from '@/components/FormAction';
import { ollamaService } from '@/services/ollama';
import { formatSize } from '@/utils/format';

import { useDownloadMonitor } from './useDownloadMonitor';

interface OllamaModelDownloaderProps {
  model: string;
}

const OllamaModelDownloader = memo<OllamaModelDownloaderProps>(({ model }) => {
  const { t } = useTranslation(['modelProvider', 'error']);

  const [modelToPull, setModelToPull] = useState(model);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const { remainingTime, downloadSpeed } = useDownloadMonitor(total, completed);
  const percent = useMemo(() => {
    return total ? Number(((completed / total) * 100).toFixed(1)) : 0;
  }, [completed, total]);

  const theme = useTheme();

  const { mutate, isLoading: isDownloading } = useSWR(
    [modelToPull],
    async ([model]) => {
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
      onSuccess: () => {},
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  );

  return (
    <Center gap={16} paddingBlock={32} style={{ width: '100%' }}>
      <FormAction
        avatar={<Ollama color={theme.colorPrimary} size={64} />}
        description={isDownloading ? t('ollama.download.desc') : t('ollama.unlock.description')}
        title={
          isDownloading
            ? t('ollama.download.title', { model: modelToPull })
            : t('ollama.unlock.title')
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
        <Flexbox flex={1} gap={8} style={{ maxWidth: 300 }} width={'100%'}>
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
              {t('ollama.download.remainingTime')}: {remainingTime}
            </span>
            <span>
              {t('ollama.download.speed')}: {downloadSpeed}
            </span>
          </Flexbox>
        </Flexbox>
      )}
      <Flexbox gap={12} style={{ maxWidth: 300 }} width={'100%'}>
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
            ? t('ollama.unlock.confirm')
            : // if total is 0, show starting, else show downloaded
              !total
              ? t('ollama.unlock.starting')
              : t('ollama.unlock.downloaded', {
                  completed: formatSize(completed, 2),
                  total: formatSize(total, 2),
                })}
        </Button>
        {isDownloading && (
          <Button
            onClick={() => {
              ollamaService.abort();
            }}
          >
            {t('ollama.unlock.cancel')}
          </Button>
        )}
      </Flexbox>
    </Center>
  );
});

export default OllamaModelDownloader;
