'use client';

import { Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { AlertTriangle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionButtons } from './ActionButtons';
import { useStyles } from './styles';
import { ErrorStateProps } from './types';

// 错误状态组件
export const ErrorState = memo<ErrorStateProps>(
  ({ generation, aspectRatio, onDelete, onCopyError }) => {
    const { styles } = useStyles();
    const { t } = useTranslation('image');

    const errorMessage = generation.task.error
      ? typeof generation.task.error.body === 'string'
        ? generation.task.error.body
        : generation.task.error.body?.detail || generation.task.error.name || 'Unknown error'
      : '';

    return (
      <div className={styles.placeholderContainer} style={{ aspectRatio }}>
        <div className={styles.errorContent}>
          <Icon className={styles.errorIcon} icon={AlertTriangle} size={20} />
          <div>{t('generation.status.failed')}</div>
          {generation.task.error && (
            <Typography.Paragraph
              className={styles.errorText}
              ellipsis={{ rows: 2 }}
              onClick={onCopyError}
              title={t('generation.actions.copyError')}
            >
              {errorMessage}
            </Typography.Paragraph>
          )}
        </div>
        <ActionButtons onDelete={onDelete} />
      </div>
    );
  },
);

ErrorState.displayName = 'ErrorState';
