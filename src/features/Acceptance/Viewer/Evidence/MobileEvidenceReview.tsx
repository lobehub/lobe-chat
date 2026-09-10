'use client';

import { Flexbox } from '@lobehub/ui';
import { ActionIcon, Button, Segmented, Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { MobileReviewEvent } from './mobileReviewFlow';

const styles = createStaticStyles(({ css }) => ({
  body: css`
    display: flex;
    flex: 1;
    flex-direction: column;

    min-width: 0;
    min-height: 0;
  `,
  /** The one scroll on the page — image on top, the notes it earns below it. */
  scroll: css`
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;

    min-height: 0;
    padding-block-end: 12px;
  `,
  /** The image keeps a fixed slice of the screen so the notes under it are
      reachable without a second screen — but stays tall enough to circle on. */
  stage: css`
    display: flex;
    flex: none;
    height: 42dvh;
    min-height: 220px;
  `,
  editor: css`
    flex: none;
    padding-block-start: 4px;

    textarea {
      font-size: 16px;
    }
  `,
  footer: css`
    display: flex;
    flex: none;
    flex-direction: column;
    gap: 8px;

    padding-block-start: 8px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};

    > button {
      min-height: 44px;
    }
  `,
}));

interface MobileEvidenceReviewProps {
  /** Regions already drawn on the image on screen. */
  annotationCount: number;
  canSubmit: boolean;
  drawing: boolean;
  /** Region notes, the supplementary note and attachments — all under the image. */
  editor: ReactNode;
  failed: boolean;
  image: ReactNode;
  imageCount: number;
  imageIndex: number;
  loading: boolean;
  onConfirm: () => void;
  onImageChange: (index: number) => void;
  /** Move the browse / mark flow along — see mobileReviewFlow. */
  onStep: (event: MobileReviewEvent) => void;
  onZoom: (direction: 1 | -1) => void;
  zoom: number;
}

/**
 * Phone review on one page: look at the image, circle what is wrong, and write
 * the note right where the circle landed.
 */
export const MobileEvidenceReview = ({
  annotationCount,
  canSubmit,
  drawing,
  failed,
  editor,
  image,
  imageCount,
  imageIndex,
  loading,
  onConfirm,
  onImageChange,
  onStep,
  onZoom,
  zoom,
}: MobileEvidenceReviewProps) => {
  const { t } = useTranslation('verify');
  return (
    <div className={styles.body}>
      <div className={styles.scroll}>
        {imageCount > 0 && (
          <>
            <Flexbox horizontal align={'center'} gap={8} style={{ flex: 'none' }}>
              <ActionIcon
                aria-label={t('acceptance.review.previousImage')}
                disabled={imageIndex <= 0}
                icon={ChevronLeft}
                size={{ blockSize: 44, size: 20 }}
                onClick={() => onImageChange(imageIndex - 1)}
              />
              <Text aria-live={'polite'} style={{ flex: 1, textAlign: 'center' }}>
                {t('acceptance.review.imageNumber', {
                  current: imageIndex + 1,
                  total: imageCount,
                })}
              </Text>
              <ActionIcon
                aria-label={t('acceptance.review.nextImage')}
                disabled={imageIndex >= imageCount - 1}
                icon={ChevronRight}
                size={{ blockSize: 44, size: 20 }}
                onClick={() => onImageChange(imageIndex + 1)}
              />
            </Flexbox>
            <div className={styles.stage}>{image}</div>
            <Flexbox horizontal align={'center'} gap={8} style={{ flex: 'none' }}>
              {/* A mode switch, not an action button. The old single button was
                  labelled with the mode it would LEAVE, so it read as a stray
                  box whose 44px slab said nothing about which mode was on. */}
              <Segmented
                size={'small'}
                value={drawing ? 'draw' : 'browse'}
                options={[
                  { label: t('acceptance.review.browseImage'), value: 'browse' },
                  { label: t('acceptance.review.drawRegion'), value: 'draw' },
                ]}
                onChange={(value) => {
                  if ((value === 'draw') !== drawing) onStep('toggle-draw');
                }}
              />
              <Flexbox flex={1} />
              <ActionIcon
                aria-label={t('acceptance.review.zoomOut')}
                disabled={zoom <= 0.5}
                icon={ZoomOut}
                size={{ blockSize: 44, size: 20 }}
                onClick={() => onZoom(-1)}
              />
              <Text fontSize={12}>{Math.round(zoom * 100)}%</Text>
              <ActionIcon
                aria-label={t('acceptance.review.zoomIn')}
                disabled={zoom >= 4}
                icon={ZoomIn}
                size={{ blockSize: 44, size: 20 }}
                onClick={() => onZoom(1)}
              />
            </Flexbox>
            {/* The hint is the region's receipt: it says the box landed AND
                that it is still editable, right above the note it belongs to. */}
            <Text fontSize={12} style={{ flex: 'none' }} type={'secondary'}>
              {drawing && annotationCount > 0
                ? t('acceptance.review.mobileDrawnHint', { count: annotationCount })
                : t(
                    drawing
                      ? 'acceptance.review.mobileDrawHint'
                      : 'acceptance.review.mobileBrowseHint',
                  )}
            </Text>
          </>
        )}
        <div className={styles.editor}>{editor}</div>
      </div>
      <div className={styles.footer}>
        {failed && (
          <Text role={'alert'} type={'danger'}>
            {t('acceptance.review.submitFailed')}
          </Text>
        )}
        <Button disabled={!canSubmit} loading={loading} type={'primary'} onClick={onConfirm}>
          {t('acceptance.review.confirmReject')}
        </Button>
      </div>
    </div>
  );
};
