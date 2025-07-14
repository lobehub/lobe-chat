'use client';

import { Block } from '@lobehub/ui';
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
      <Block
        align={'center'}
        className={styles.imageContainer}
        justify={'center'}
        style={{
          aspectRatio,
          maxWidth: generation.asset?.width ? generation.asset.width / 2 : 'unset',
        }}
        variant={'filled'}
      >
        <ImageItem
          alt={prompt}
          preview={{
            src: generation.asset!.url,
          }}
          style={{ height: '100%', width: '100%' }}
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
      </Block>
    );
  },
);

SuccessState.displayName = 'SuccessState';
