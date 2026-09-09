'use client';

import { Flexbox, Icon } from '@lobehub/ui';
import { ActionIcon, Button, Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { MobileReviewEvent } from './mobileReviewFlow';

const styles = createStaticStyles(({ css }) => ({
  body: css`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;

    min-width: 0;
    min-height: 0;
  `,
  editor: css`
    overflow-y: auto;
    overscroll-behavior: contain;
    flex: 1;

    min-height: 0;
    padding-block: 8px 16px;

    textarea {
      font-size: 16px;
    }
  `,
  footer: css`
    display: flex;
    flex: none;
    gap: 8px;

    padding-block-start: 8px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};

    > button {
      flex: 1;
      min-height: 44px;
    }
  `,
}));

interface MobileEvidenceReviewProps {
  /** Regions already drawn on the image on screen. */
  annotationCount: number;
  canSubmit: boolean;
  drawing: boolean;
  editor: ReactNode;
  failed: boolean;
  image: ReactNode;
  imageCount: number;
  imageIndex: number;
  loading: boolean;
  onConfirm: () => void;
  onImageChange: (index: number) => void;
  /** Move the browse / mark / write flow along — see mobileReviewFlow. */
  onStep: (event: MobileReviewEvent) => void;
  onZoom: (direction: 1 | -1) => void;
  showFeedback: boolean;
  zoom: number;
}

/** Phone review has one task at a time: inspect/mark the image, then write feedback. */
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
  showFeedback,
  zoom,
}: MobileEvidenceReviewProps) => {
  const { t } = useTranslation('verify');
  return (
    <div className={styles.body}>
      {showFeedback ? (
        <>
          {imageCount > 0 && (
            <Button
              icon={<Icon icon={ArrowLeft} />}
              style={{ alignSelf: 'flex-start', minHeight: 44 }}
              type={'text'}
              onClick={() => onStep('back-to-images')}
            >
              {t('acceptance.review.backToImages')}
            </Button>
          )}
          <div className={styles.editor}>{editor}</div>
          {failed && (
            <Text role={'alert'} type={'danger'}>
              {t('acceptance.review.submitFailed')}
            </Text>
          )}
          <div className={styles.footer}>
            <Button disabled={!canSubmit} loading={loading} type={'primary'} onClick={onConfirm}>
              {t('acceptance.review.confirmReject')}
            </Button>
          </div>
        </>
      ) : (
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
              {t('acceptance.review.imageNumber', { current: imageIndex + 1, total: imageCount })}
            </Text>
            <ActionIcon
              aria-label={t('acceptance.review.nextImage')}
              disabled={imageIndex >= imageCount - 1}
              icon={ChevronRight}
              size={{ blockSize: 44, size: 20 }}
              onClick={() => onImageChange(imageIndex + 1)}
            />
          </Flexbox>
          {image}
          <Flexbox horizontal align={'center'} gap={8} style={{ flex: 'none' }}>
            {/* The hint is the only receipt a drawn box gets on a phone: it
                says the region landed AND that it is still editable, which is
                what the old jump-to-notes step took away. */}
            <Text fontSize={12} style={{ flex: 1 }} type={'secondary'}>
              {drawing && annotationCount > 0
                ? t('acceptance.review.mobileDrawnHint', { count: annotationCount })
                : t(
                    drawing
                      ? 'acceptance.review.mobileDrawHint'
                      : 'acceptance.review.mobileBrowseHint',
                  )}
            </Text>
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
          <div className={styles.footer}>
            <Button aria-pressed={drawing} onClick={() => onStep('toggle-draw')}>
              {t(drawing ? 'acceptance.review.browseImage' : 'acceptance.review.drawRegion')}
            </Button>
            <Button type={'primary'} onClick={() => onStep('write-feedback')}>
              {t('acceptance.review.writeFeedback')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
