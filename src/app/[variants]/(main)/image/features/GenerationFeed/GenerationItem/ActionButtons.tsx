'use client';

import { ActionIconGroup, ActionIconGroupProps } from '@lobehub/ui';
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
      <ActionIconGroup
        actionIconProps={{
          tooltipProps: { placement: 'left' },
        }}
        className={styles.generationActionButton}
        horizontal={false}
        items={
          [
            Boolean(showDownload && onDownload) && {
              icon: Download,
              key: 'download',
              label: t('generation.actions.download'),
              onClick: onDownload,
            },
            Boolean(showCopySeed && onCopySeed) && {
              icon: Dices,
              key: 'copySeed',
              label: seedTooltip,
              onClick: onCopySeed,
            },
            {
              danger: true,
              icon: Trash2,
              key: 'delete',
              label: t('generation.actions.delete'),
              onClick: onDelete,
            },
          ].filter(Boolean) as ActionIconGroupProps['items']
        }
        variant="outlined"
      />
    );
  },
);

ActionButtons.displayName = 'ActionButtons';
