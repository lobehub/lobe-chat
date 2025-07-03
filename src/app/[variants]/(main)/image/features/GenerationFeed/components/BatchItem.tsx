'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { ModelTag } from '@lobehub/icons';
import { ActionIcon, Block, Grid, Highlighter, Tag, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { omit } from 'lodash-es';
import { Settings, Trash2 } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import InvalidAPIKey from '@/features/Conversation/Error/InvalidAPIKey';
import { useImageStore } from '@/store/image';
import { StdImageGenParams } from '@/store/image/utils/StandardParameters';
import { AsyncTaskErrorType } from '@/types/asyncTask';
import { GenerationBatch } from '@/types/generation';

import { GenerationItem } from './GenerationItem';

const useStyles = createStyles(({ css, token }) => ({
  prompt: css`
    pre {
      overflow: hidden !important;
      padding-block: 4px;
      font-size: 13px;
    }
  `,
  container: css`
    time {
      opacity: 0;
    }

    &:hover {
      time {
        opacity: 1;
      }
    }
  `,
  batchActions: css`
    display: flex;
    gap: 8px;
    justify-content: flex-start;
  `,

  batchDeleteButton: css`
    &:hover {
      border-color: ${token.colorError} !important;
      color: ${token.colorError} !important;
      background: ${token.colorErrorBg} !important;
    }
  `,
}));

// 扩展 dayjs 插件
dayjs.extend(relativeTime);

interface GenerationBatchItemProps {
  batch: GenerationBatch;
}

export const GenerationBatchItem = memo<GenerationBatchItemProps>(({ batch }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('image');
  const { t: modelProviderT } = useTranslation('modelProvider');
  const { t: errorT } = useTranslation('error');

  const [imageGridRef] = useAutoAnimate();

  const activeTopicId = useImageStore((s) => s.activeGenerationTopicId);
  const removeGenerationBatch = useImageStore((s) => s.removeGenerationBatch);
  const recreateImage = useImageStore((s) => s.recreateImage);
  const reuseSettings = useImageStore((s) => s.reuseSettings);

  const time = useMemo(() => {
    return dayjs(batch.createdAt).format('YYYY-MM-DD HH:mm:ss');
  }, [batch.createdAt]);

  const handleReuseSettings = () => {
    reuseSettings(batch.model, batch.provider, omit(batch.config as StdImageGenParams, ['seed']));
  };

  const handleDeleteBatch = async () => {
    if (!activeTopicId) return;

    try {
      await removeGenerationBatch(batch.id, activeTopicId);
    } catch (error) {
      console.error('Failed to delete batch:', error);
    }
  };

  if (batch.generations.length === 0) {
    return null;
  }

  const isInvalidApiKey = batch.generations.some(
    (generation) => generation.task.error?.name === AsyncTaskErrorType.InvalidProviderAPIKey,
  );

  if (isInvalidApiKey) {
    return (
      <InvalidAPIKey
        bedrockDescription={modelProviderT('bedrock.unlock.imageGenerationDescription')}
        description={errorT('unlock.apiKey.imageGenerationDescription', {
          name: batch.provider,
        })}
        id={batch.id}
        onClose={() => {
          removeGenerationBatch(batch.id, activeTopicId!);
        }}
        onRecreate={() => {
          recreateImage(batch.id);
        }}
        provider={batch.provider}
      />
    );
  }

  return (
    <Block className={styles.container} gap={8} variant="borderless">
      <Highlighter
        actionIconSize={'small'}
        className={styles.prompt}
        language={'md'}
        showLanguage={false}
        variant={'borderless'}
        wrap
      >
        {batch.prompt}
      </Highlighter>
      <Flexbox gap={4} horizontal justify="space-between">
        <Flexbox gap={4} horizontal>
          <ModelTag model={batch.model} />
          {batch.width && batch.height && (
            <Tag>
              {batch.width} × {batch.height}
            </Tag>
          )}
          <Tag>{t('generation.metadata.count', { count: batch.generations.length })}</Tag>
        </Flexbox>
        <Text as={'time'} fontSize={12} type={'secondary'}>
          {time}
        </Text>
      </Flexbox>

      <Grid maxItemWidth={200} ref={imageGridRef} rows={4}>
        {batch.generations.map((generation) => (
          <GenerationItem generation={generation} key={generation.id} prompt={batch.prompt} />
        ))}
      </Grid>

      <div className={styles.batchActions}>
        <ActionIcon
          icon={Settings}
          onClick={handleReuseSettings}
          size={{ blockSize: 32, size: 16 }}
          title={t('generation.actions.reuseSettings')}
        />
        <ActionIcon
          className={styles.batchDeleteButton}
          icon={Trash2}
          onClick={handleDeleteBatch}
          size={{ blockSize: 32, size: 16 }}
          title={t('generation.actions.deleteBatch')}
        />
      </div>
    </Block>
  );
});

GenerationBatchItem.displayName = 'GenerationBatchItem';
