'use client';

import { ActionIcon } from '@lobehub/ui';
import { Dices, Download, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './styles';
import { ActionButtonsProps } from './types';

// 操作按钮组件
export const ActionButtons = memo<ActionButtonsProps>(
  ({
    onDelete,
    onDownload,
    onCopySeed,
    showDownload = false,
    showCopySeed = false,
    seedTooltip,
  }) => {
    const { styles } = useStyles();
    const { t } = useTranslation('image');

    return (
      <>
        <ActionIcon
          className={`${styles.generationActionButton} ${styles.generationDelete} generation-action-button`}
          icon={Trash2}
          onClick={onDelete}
          size={{ blockSize: 24, size: 14 }}
          title={t('generation.actions.delete')}
          tooltipProps={{ placement: 'right' }}
        />
        {showDownload && onDownload && (
          <ActionIcon
            className={`${styles.generationActionButton} ${styles.generationDownload} generation-action-button`}
            icon={Download}
            onClick={onDownload}
            size={{ blockSize: 24, size: 14 }}
            title={t('generation.actions.download')}
            tooltipProps={{ placement: 'right' }}
          />
        )}
        {showCopySeed && onCopySeed && (
          <ActionIcon
            className={`${styles.generationActionButton} ${styles.generationCopySeed} generation-action-button`}
            icon={Dices}
            onClick={onCopySeed}
            size={{ blockSize: 24, size: 14 }}
            title={seedTooltip}
            tooltipProps={{ placement: 'right' }}
          />
        )}
      </>
    );
  },
);

ActionButtons.displayName = 'ActionButtons';
