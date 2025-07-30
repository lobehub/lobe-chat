'use client';

import { Block, Icon, Text } from '@lobehub/ui';
import { ImageOffIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { ActionButtons } from './ActionButtons';
import { useStyles } from './styles';
import { ErrorStateProps } from './types';
import { getThumbnailMaxWidth } from './utils';

// 错误状态组件
export const ErrorState = memo<ErrorStateProps>(
  ({ generation, generationBatch, aspectRatio, onDelete, onCopyError }) => {
    const { styles, theme } = useStyles();
    const { t } = useTranslation('image');

    const errorMessage = generation.task.error
      ? typeof generation.task.error.body === 'string'
        ? generation.task.error.body
        : generation.task.error.body?.detail || generation.task.error.name || 'Unknown error'
      : '';

    return (
      <Block
        align={'center'}
        className={styles.placeholderContainer}
        justify={'center'}
        onClick={onCopyError}
        padding={16}
        style={{
          aspectRatio,
          cursor: 'pointer',
          maxWidth: getThumbnailMaxWidth(generation, generationBatch),
        }}
        variant={'filled'}
      >
        <Center gap={8}>
          <Icon color={theme.colorTextDescription} icon={ImageOffIcon} size={24} />
          <Text strong type={'secondary'}>
            {t('generation.status.failed')}
          </Text>
          {generation.task.error && (
            <Text
              code
              ellipsis={{ rows: 2 }}
              fontSize={10}
              style={{
                wordBreak: 'break-all',
              }}
              title={t('generation.actions.copyError')}
              type={'secondary'}
            >
              {errorMessage}
            </Text>
          )}
        </Center>
        <ActionButtons onDelete={onDelete} />
      </Block>
    );
  },
);

ErrorState.displayName = 'ErrorState';
