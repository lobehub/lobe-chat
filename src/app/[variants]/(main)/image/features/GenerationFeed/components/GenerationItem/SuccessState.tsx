'use client';

import { memo } from 'react';

import ImageItem from '@/components/ImageItem';

import { ActionButtons } from './ActionButtons';
import { useStyles } from './styles';
import { SuccessStateProps } from './types';

// 成功状态组件
export const SuccessState = memo<SuccessStateProps>(
  ({ generation, prompt, aspectRatio, onDelete, onDownload, onCopySeed, seedTooltip }) => {
    const { styles } = useStyles();

    return (
      <div className={styles.imageContainer} style={{ aspectRatio }}>
        <ImageItem
          alt={prompt}
          preview={{
            src: generation.asset!.url,
          }}
          style={{ width: '100%', height: '100%' }}
          url={generation.asset!.thumbnailUrl}
        />
        <ActionButtons
          onCopySeed={onCopySeed}
          onDelete={onDelete}
          onDownload={onDownload}
          seedTooltip={seedTooltip}
          showCopySeed={!!generation.seed}
          showDownload
        />
      </div>
    );
  },
);

SuccessState.displayName = 'SuccessState';
