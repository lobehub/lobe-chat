'use client';

import { Icon } from '@lobehub/ui';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { AsyncTaskStatus } from '@/types/asyncTask';

import { ElapsedTime } from '../ElapsedTime';
import { ActionButtons } from './ActionButtons';
import { useStyles } from './styles';
import { LoadingStateProps } from './types';

// 加载状态组件
export const LoadingState = memo<LoadingStateProps>(({ generation, aspectRatio, onDelete }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('image');

  const isGenerating =
    generation.task.status === AsyncTaskStatus.Processing ||
    generation.task.status === AsyncTaskStatus.Pending;

  return (
    <div className={styles.placeholderContainer} style={{ aspectRatio }}>
      <div className={styles.loadingContent}>
        <Icon className={styles.spinIcon} icon={Loader2} size={20} spin />
        <div>{t('generation.status.generating')}</div>
        <ElapsedTime generationId={generation.id} isActive={isGenerating} />
      </div>
      <ActionButtons onDelete={onDelete} />
    </div>
  );
});

LoadingState.displayName = 'LoadingState';
