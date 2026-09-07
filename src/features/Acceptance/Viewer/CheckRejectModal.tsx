'use client';

import type { AcceptanceReviewAnnotation } from '@lobechat/types';
import { Flexbox, TextArea } from '@lobehub/ui';
import { ActionIcon, Button, createModal, Text, useModalContext } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar, cx, useResponsive } from 'antd-style';
import { Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AnnotationCanvas } from './Annotation';
import type { PendingAttachment } from './attachments';
import { AttachmentStrip, AttachmentUploadButton, useFeedbackAttachments } from './attachments';
import { MobileEvidenceReview } from './MobileEvidenceReview';
import { frostedModalStyles } from './modals';
import { useReviewSubmit } from './useReviewSubmit';

export const CHECK_REJECT_MODAL_SIZE = { height: '98dvh', width: '98vw' } as const;
export const TEXT_REJECT_MODAL_WIDTH = 'min(560px, calc(100vw - 32px))';

const styles = createStaticStyles(({ css }) => ({
  mobilePopup: css`
    @media (width <= 767px) {
      max-width: 100vw !important;

      > div {
        width: 100vw;
        max-width: 100vw;
        height: 100dvh;
        max-height: 100dvh;
        padding: 0;
        border-radius: 0;
      }
    }
  `,
  mobileClose: css`
    @media (width <= 767px) {
      inset-block-start: max(4px, env(safe-area-inset-top));
      inset-inline-end: 4px;
      width: 44px;
      height: 44px;
    }
  `,
  mobileHeader: css`
    @media (width <= 767px) {
      min-height: 56px;
      padding-block: max(12px, env(safe-area-inset-top)) 12px;
      padding-inline: 12px 52px;
    }
  `,
  mobileContent: css`
    @media (width <= 767px) {
      padding-block: 0 max(12px, env(safe-area-inset-bottom));
      padding-inline: 12px;
    }
  `,
  modalPopup: css`
    > div {
      display: flex;
      flex-direction: column;
    }
  `,
  modalPopupMedia: css`
    > div {
      width: ${CHECK_REJECT_MODAL_SIZE.width};
      max-width: ${CHECK_REJECT_MODAL_SIZE.width};
      height: ${CHECK_REJECT_MODAL_SIZE.height};

      @media (width <= 767px) {
        width: 100vw;
        max-width: 100vw;
        height: 100dvh;
        max-height: 100dvh;
        padding: 0;
        border-radius: 0;
      }
    }
  `,
  fullscreenBody: css`
    display: flex;
    flex: 1;
    gap: 16px;
    min-height: 0;

    @media (width <= 767px) {
      flex-direction: column;
      gap: 12px;
    }
  `,
  modalBody: css`
    overflow: hidden;
    display: flex;
    flex: 1;
    flex-direction: column;

    min-height: 0;
  `,
  modalFooter: css`
    flex: none;
    padding-block-start: 12px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};
  `,
  regionIndex: css`
    flex: none;

    width: 18px;
    height: 18px;
    border-radius: 50%;

    font-size: 11px;
    font-weight: 600;
    line-height: 18px;
    color: #fff;
    text-align: center;

    background: ${cssVar.colorError};
  `,
  sidePanel: css`
    overflow-y: auto;
    display: flex;
    flex: none;
    flex-direction: column;
    gap: 12px;

    width: 320px;
    min-width: 0;

    @media (width <= 767px) {
      flex: 0 1 auto;
      width: 100%;
      max-height: none;
    }
  `,
  thumb: css`
    cursor: pointer;

    overflow: hidden;

    width: 72px;
    height: 48px;
    border: 2px solid transparent;
    border-radius: ${cssVar.borderRadius};

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
  thumbActive: css`
    border-color: ${cssVar.colorPrimary};
  `,
  /** The fullscreen zoom stage — its native scrolling doubles as panning.
      Flex + the inner frame's `margin: auto` keeps the image centered when it
      fits the stage, and scrolls from the edges once it grows past it. */
  viewport: css`
    overflow: auto;
    overscroll-behavior: contain;
    display: flex;
    flex: 1;

    min-width: 0;
    min-height: 120px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorFillQuaternary};
  `,
  /** The centered image frame inside the stage — `margin: auto` absorbs the
      free space on both axes (centering) and collapses to 0 on overflow. */
  viewportInner: css`
    margin: auto;
  `,
  /** The zoom pill floats bottom-center over the stage — controls live with
      the thing they control, not in a detached toolbar row. */
  zoomBar: css`
    position: absolute;
    z-index: 5;
    inset-block-end: 16px;
    inset-inline-start: 50%;
    transform: translateX(-50%);

    display: flex;
    gap: 4px;
    align-items: center;

    padding-block: 4px;
    padding-inline: 8px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 99px;

    background: ${cssVar.colorBgElevated};
    box-shadow: ${cssVar.boxShadowSecondary};

    @media (width <= 767px) {
      position: static;
      transform: none;
      align-self: center;
    }
  `,
  zoomLabel: css`
    min-width: 44px;

    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${cssVar.colorTextSecondary};
    text-align: center;
  `,
}));

/** One annotatable evidence image (already filtered to visual, file-backed). */
export interface RejectableEvidence {
  fileUrl: string;
  id: string;
}

interface DraftAnnotationEntry {
  comment: string;
  evidenceId: string;
  /** Stable identity — rapid move/resize updates must never key off object
      identity, which a stale render closure invalidates mid-gesture. */
  key: number;
  rect: AcceptanceReviewAnnotation['rect'];
}

let draftAnnotationSeq = 0;
const nextAnnotationKey = () => ++draftAnnotationSeq;

/** What survives a refresh — typed feedback is too costly to lose to one F5. */
interface RejectDraft {
  annotations: DraftAnnotationEntry[];
  attachments?: PendingAttachment[];
  comment: string;
}

export const serializeReviewAnnotations = (
  annotations: DraftAnnotationEntry[],
): AcceptanceReviewAnnotation[] =>
  annotations.map(({ comment, evidenceId, rect }) => ({
    comment: comment.trim() || undefined,
    evidenceId,
    rect,
  }));

const draftStorageKey = (key: string) => `acceptance-reject-draft:${key}`;

const readDraft = (key: string | undefined): RejectDraft | null => {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(draftStorageKey(key));
    return raw ? (JSON.parse(raw) as RejectDraft) : null;
  } catch {
    return null;
  }
};

const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3, 4];

export const checkRejectModalSize = (evidenceCount: number) =>
  evidenceCount > 0
    ? CHECK_REJECT_MODAL_SIZE
    : ({ height: 'auto', width: TEXT_REJECT_MODAL_WIDTH } as const);

export const checkRejectModalShell = (evidenceCount: number) => {
  const modalSize = checkRejectModalSize(evidenceCount);
  return {
    classNames: {
      close: styles.mobileClose,
      content: styles.mobileContent,
      header: styles.mobileHeader,
      popup: cx(styles.modalPopup, styles.mobilePopup, evidenceCount > 0 && styles.modalPopupMedia),
    },
    styles: {
      ...frostedModalStyles,
      content: { display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' },
    },
    width: modalSize.width,
  };
};

export const rejectModalTitle = (title: string, description?: string) => ({
  description: description?.trim() || undefined,
  title,
});

export const canDismissRejectModal = (loading: boolean) => !loading;

interface CheckRejectModalProps {
  checkDescription?: string;
  checkTitle: string;
  /** Stable key (the check id) for the refresh-surviving draft cache. */
  draftKey?: string;
  evidence: RejectableEvidence[];
  /**
   * Regions to open with — set when confirming a model proposal, so the
   * reviewer edits the model's boxes instead of redrawing them. Any stored
   * draft is ignored in that case: the proposal is the newer starting point.
   */
  initialAnnotations?: AcceptanceReviewAnnotation[];
  /** Feedback already typed in the focused detail before opening annotation. */
  initialComment?: string;
  initialEvidenceId?: string;
  /** Perform the reject; resolve true to close, false to stay open. */
  onConfirm: (value: {
    annotations: AcceptanceReviewAnnotation[];
    comment: string;
    fileIds: string[];
  }) => Promise<boolean>;
  previousAnnotations?: AcceptanceReviewAnnotation[];
  previousAttachments?: PendingAttachment[];
  previousComment?: string;
}

export const mergeRejectComments = (initialComment = '', storedComment = '') => {
  const initial = initialComment.trim();
  const stored = storedComment.trim();
  if (!initial) return stored;
  if (!stored || stored === initial) return initial;
  return `${initial}\n\n${stored}`;
};

const CheckRejectModalContent = memo<CheckRejectModalProps>(
  ({
    checkTitle,
    draftKey,
    evidence,
    initialAnnotations,
    initialComment,
    initialEvidenceId,
    previousAnnotations,
    previousAttachments,
    previousComment,
    onConfirm,
  }) => {
    const { t: translate } = useTranslation('verify');
    const { md = true } = useResponsive();
    const [drawing, setDrawing] = useState(false);
    const [showFeedback, setShowFeedback] = useState(evidence.length === 0);
    const swipeStart = useRef<{ x: number; y: number } | null>(null);
    const { close, setCanDismissByClickOutside } = useModalContext();
    const [draft] = useState(() => readDraft(draftKey));
    const [comment, setComment] = useState(() =>
      // A proposal supersedes the stored draft rather than merging with it —
      // splicing the model's sentence into half-typed notes would produce
      // feedback neither party wrote.
      initialAnnotations?.length
        ? (initialComment ?? '')
        : mergeRejectComments(initialComment, draft?.comment ?? previousComment),
    );
    const { failed, loading, submit } = useReviewSubmit();
    const [activeEvidenceId, setActiveEvidenceId] = useState(initialEvidenceId ?? evidence[0]?.id);
    const [annotations, setAnnotations] = useState<DraftAnnotationEntry[]>(() => {
      const source = initialAnnotations?.length
        ? initialAnnotations
        : (draft?.annotations ?? previousAnnotations ?? []);
      return (
        source
          // Only restore regions whose evidence still exists — a new round may
          // have replaced the artifacts since the draft was written.
          .filter((entry) => evidence.some((item) => item.id === entry.evidenceId))
          .map((entry) => ({
            comment: entry.comment ?? '',
            evidenceId: entry.evidenceId,
            key: nextAnnotationKey(),
            rect: entry.rect,
          }))
      );
    });

    useEffect(() => {
      setCanDismissByClickOutside(canDismissRejectModal(loading));
    }, [loading, setCanDismissByClickOutside]);

    // Your own screenshots (paste or upload) — attached to the reject alongside
    // the note and any circled regions.
    const { attachments, fileIds, handlePaste, remove, uploadFiles, uploading } =
      useFeedbackAttachments(6, draft?.attachments ?? previousAttachments);

    const [zoom, setZoom] = useState(1);
    const viewportRef = useRef<HTMLDivElement>(null);
    const [viewportWidth, setViewportWidth] = useState<number>();
    useLayoutEffect(() => {
      if (evidence.length === 0) return;
      let observer: ResizeObserver | undefined;
      let raf = 0;
      // The Modal body mounts async (portal + open animation), so the ref may
      // be null on the first pass — retry on the next frame until it attaches,
      // then track its width. Without this the image stays fit-width and zoom
      // does nothing (viewportWidth never resolves).
      const attach = () => {
        const node = viewportRef.current;
        if (!node) {
          raf = requestAnimationFrame(attach);
          return;
        }
        const measure = () => setViewportWidth(node.clientWidth);
        measure();
        observer = new ResizeObserver(measure);
        observer.observe(node);
      };
      attach();
      return () => {
        cancelAnimationFrame(raf);
        observer?.disconnect();
      };
    }, [activeEvidenceId, evidence.length, showFeedback]);

    // Persist the draft as it is typed; an empty draft cleans the slot up.
    useEffect(() => {
      if (!draftKey) return;
      try {
        if (!comment && annotations.length === 0 && attachments.length === 0) {
          localStorage.removeItem(draftStorageKey(draftKey));
        } else {
          localStorage.setItem(
            draftStorageKey(draftKey),
            JSON.stringify({ annotations, attachments, comment } satisfies RejectDraft),
          );
        }
      } catch {
        /* quota/private mode — the draft is a convenience, never a blocker */
      }
    }, [annotations, attachments, comment, draftKey]);

    const activeIndex = evidence.findIndex((item) => item.id === activeEvidenceId);
    const selectEvidence = (index: number) => {
      if (!evidence[index]) return;
      setActiveEvidenceId(evidence[index].id);
      setZoom(1);
      viewportRef.current?.scrollTo(0, 0);
    };
    const activeEvidence = evidence.find((item) => item.id === activeEvidenceId);
    const activeAnnotations = annotations.filter((item) => item.evidenceId === activeEvidenceId);

    const stepZoom = (direction: 1 | -1) =>
      setZoom((current) => {
        const index = ZOOM_STEPS.findIndex((step) => Math.abs(step - current) < 0.001);
        const at = index === -1 ? 2 : index;
        return ZOOM_STEPS[Math.min(Math.max(at + direction, 0), ZOOM_STEPS.length - 1)];
      });

    // The reject IS its feedback — at least one note (global or per-region) or
    // an attached screenshot the next round can act on.
    const canSubmit =
      Boolean(comment.trim()) ||
      annotations.some((annotation) => annotation.comment.trim()) ||
      fileIds.length > 0;

    const handleConfirm = async () => {
      const confirmed = await submit(() =>
        onConfirm({
          annotations: serializeReviewAnnotations(annotations),
          comment: comment.trim(),
          fileIds,
        }),
      );
      if (confirmed) {
        if (draftKey) localStorage.removeItem(draftStorageKey(draftKey));
        close();
      }
    };

    const hasEvidence = evidence.length > 0;

    const canvasHandlers = {
      onDraw: (rect: AcceptanceReviewAnnotation['rect']) => {
        setAnnotations((previous) => [
          ...previous,
          { comment: '', evidenceId: activeEvidence!.id, key: nextAnnotationKey(), rect },
        ]);
        if (!md) {
          setDrawing(false);
          setShowFeedback(true);
        }
      },
      onRemove: (index: number) => {
        const target = activeAnnotations[index];
        if (target)
          setAnnotations((previous) => previous.filter((item) => item.key !== target.key));
      },
      onUpdate: (index: number, rect: AcceptanceReviewAnnotation['rect']) => {
        const target = activeAnnotations[index];
        if (target)
          setAnnotations((previous) =>
            previous.map((item) => (item.key === target.key ? { ...item, rect } : item)),
          );
      },
    };

    const annotationInputs = (md ? activeAnnotations : annotations).map((annotation, index) => (
      <Flexbox gap={8} key={annotation.key}>
        {!md && (
          <Button
            style={{ alignSelf: 'flex-start', minHeight: 44 }}
            type={'text'}
            onClick={() => {
              selectEvidence(evidence.findIndex((item) => item.id === annotation.evidenceId));
              setDrawing(true);
              setShowFeedback(false);
            }}
          >
            {translate('acceptance.review.regionImage', {
              image: evidence.findIndex((item) => item.id === annotation.evidenceId) + 1,
              region:
                annotations
                  .filter((item) => item.evidenceId === annotation.evidenceId)
                  .findIndex((item) => item.key === annotation.key) + 1,
            })}
          </Button>
        )}
        <Flexbox horizontal align={'flex-start'} gap={8}>
          <span
            className={styles.regionIndex}
            style={{ marginBlockStart: 6, display: md ? undefined : 'none' }}
          >
            {index + 1}
          </span>
          <TextArea
            aria-label={translate('acceptance.review.annotationPlaceholder', { index: index + 1 })}
            autoSize={{ maxRows: 5, minRows: 1 }}
            style={{ flex: 1, fontSize: md ? undefined : 16 }}
            value={annotation.comment}
            placeholder={translate(
              md
                ? 'acceptance.review.annotationPlaceholder'
                : 'acceptance.review.rejectPlaceholder',
              { index: index + 1 },
            )}
            onChange={(event) =>
              setAnnotations((previous) =>
                previous.map((item) =>
                  item.key === annotation.key ? { ...item, comment: event.target.value } : item,
                ),
              )
            }
          />
          <ActionIcon
            aria-label={translate('acceptance.review.removeRegion', { index: index + 1 })}
            icon={Trash2}
            size={{ blockSize: 44, size: 18 }}
            onClick={() =>
              setAnnotations((previous) => previous.filter((item) => item.key !== annotation.key))
            }
          />
        </Flexbox>
      </Flexbox>
    ));

    const thumbnails = evidence.length > 1 && (
      <Flexbox horizontal gap={8} style={{ overflowX: 'auto', flex: 'none' }}>
        {evidence.map((item) => (
          <button
            aria-pressed={item.id === activeEvidenceId}
            className={cx(styles.thumb, item.id === activeEvidenceId && styles.thumbActive)}
            key={item.id}
            style={{ flexShrink: 0 }}
            type={'button'}
            aria-label={translate('acceptance.review.imageNumber', {
              current: evidence.indexOf(item) + 1,
              total: evidence.length,
            })}
            onClick={() => selectEvidence(evidence.indexOf(item))}
          >
            <img alt={''} src={item.fileUrl} />
          </button>
        ))}
      </Flexbox>
    );

    const footer = (
      <Flexbox gap={10} style={{ width: '100%' }}>
        <Text fontSize={12} type={'secondary'}>
          {hasEvidence
            ? translate('acceptance.review.supplement')
            : translate('acceptance.review.rejectDescription', { title: checkTitle })}
        </Text>
        <TextArea
          autoSize={{ maxRows: 5, minRows: 2 }}
          placeholder={translate('acceptance.review.rejectPlaceholder')}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          onPaste={handlePaste}
        />
        <Flexbox horizontal align={'flex-start'} gap={8}>
          <Flexbox horizontal flex={1} gap={8}>
            <AttachmentUploadButton disabled={loading} onFiles={uploadFiles} />
            <AttachmentStrip
              attachments={attachments}
              disabled={loading}
              uploading={uploading}
              onRemove={remove}
            />
          </Flexbox>
          <Button disabled={loading} style={{ minHeight: md ? undefined : 44 }} onClick={close}>
            {translate('acceptance.actions.cancel')}
          </Button>
          <Button
            disabled={!canSubmit || uploading}
            loading={loading}
            style={{ minHeight: md ? undefined : 44 }}
            type={'primary'}
            onClick={handleConfirm}
          >
            {translate('acceptance.review.confirmReject')}
          </Button>
        </Flexbox>
      </Flexbox>
    );

    const imageStage = activeEvidence && (
      <div
        className={styles.viewport}
        ref={viewportRef}
        style={{
          touchAction: !md && !drawing && zoom === 1 ? 'pan-y pinch-zoom' : undefined,
        }}
        onTouchEnd={(event) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          const touch = event.changedTouches[0];
          if (!start || !touch) return;
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
            selectEvidence(activeIndex + (dx < 0 ? 1 : -1));
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          swipeStart.current =
            !md && !drawing && zoom === 1 && event.touches.length === 1
              ? { x: touch.clientX, y: touch.clientY }
              : null;
        }}
      >
        <div className={styles.viewportInner}>
          <AnnotationCanvas
            annotations={activeAnnotations}
            drawing={md || drawing}
            imageWidth={viewportWidth ? Math.max(viewportWidth * zoom - 2, 0) : undefined}
            src={activeEvidence!.fileUrl}
            {...canvasHandlers}
          />
        </div>
      </div>
    );

    if (!md)
      return (
        <MobileEvidenceReview
          canSubmit={canSubmit && !uploading}
          drawing={drawing}
          failed={failed}
          image={imageStage}
          imageCount={evidence.length}
          imageIndex={activeIndex}
          loading={loading}
          showFeedback={showFeedback}
          zoom={zoom}
          editor={
            <Flexbox gap={16}>
              {annotations.length > 0 && (
                <>
                  <Text strong>{translate('acceptance.review.regionComments')}</Text>
                  {annotationInputs}
                </>
              )}
              <Text strong>{translate('acceptance.review.supplement')}</Text>
              <TextArea
                aria-label={translate('acceptance.review.supplement')}
                autoSize={{ minRows: 4, maxRows: 10 }}
                placeholder={translate('acceptance.review.rejectPlaceholder')}
                style={{ fontSize: 16 }}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onPaste={handlePaste}
              />
              <AttachmentUploadButton disabled={loading} onFiles={uploadFiles} />
              <AttachmentStrip
                attachments={attachments}
                disabled={loading}
                uploading={uploading}
                onRemove={remove}
              />
              <Text fontSize={12} type={'secondary'}>
                {translate('acceptance.review.draftSaved')}
              </Text>
            </Flexbox>
          }
          onConfirm={handleConfirm}
          onDrawingChange={setDrawing}
          onImageChange={selectEvidence}
          onShowFeedback={setShowFeedback}
          onZoom={stepZoom}
        />
      );

    return (
      <div className={styles.modalBody}>
        {activeEvidence && (
          <Flexbox flex={1} gap={12} style={{ minHeight: 0 }}>
            <Flexbox gap={12} height={'100%'} style={{ minHeight: 0 }}>
              {md && thumbnails}
              <div className={styles.fullscreenBody} style={{ position: 'relative' }}>
                {imageStage}
                <div className={styles.zoomBar}>
                  <ActionIcon
                    disabled={zoom <= ZOOM_STEPS[0]}
                    icon={ZoomOut}
                    size={md ? 'small' : { blockSize: 44, size: 20 }}
                    title={translate('acceptance.review.zoomOut')}
                    onClick={() => stepZoom(-1)}
                  />
                  <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
                  <ActionIcon
                    disabled={zoom >= ZOOM_STEPS.at(-1)!}
                    icon={ZoomIn}
                    size={md ? 'small' : { blockSize: 44, size: 20 }}
                    title={translate('acceptance.review.zoomIn')}
                    onClick={() => stepZoom(1)}
                  />
                </div>
                <div
                  className={styles.sidePanel}
                  style={
                    !md && !drawing && activeAnnotations.length === 0
                      ? { display: 'none' }
                      : undefined
                  }
                >
                  <Flexbox gap={2}>
                    <Text strong fontSize={13}>
                      {translate('acceptance.review.regionComments')}
                    </Text>
                    <Text fontSize={12} type={'secondary'}>
                      {translate('acceptance.review.annotateHint')}
                    </Text>
                  </Flexbox>
                  {activeAnnotations.length === 0 && (
                    <Text fontSize={12} type={'secondary'}>
                      {translate('acceptance.review.regionCommentsEmpty')}
                    </Text>
                  )}
                  {annotationInputs}
                </div>
              </div>
            </Flexbox>
          </Flexbox>
        )}
        <div className={styles.modalFooter}>
          {failed && (
            <Text role={'alert'} type={'danger'}>
              {translate('acceptance.review.submitFailed')}
            </Text>
          )}
          {footer}
        </div>
      </div>
    );
  },
);

CheckRejectModalContent.displayName = 'AcceptanceCheckRejectModalContent';

/** Per-check reject modal — media gets a near-fullscreen annotation surface without losing context. */
export const openCheckRejectModal = (options: CheckRejectModalProps) => {
  const modalTitle = rejectModalTitle(options.checkTitle, options.checkDescription);
  const shell = checkRejectModalShell(options.evidence.length);

  return createModal({
    ...shell,
    content: <CheckRejectModalContent {...options} />,
    footer: null,
    maskClosable: true,
    title: (
      <Flexbox gap={2}>
        <Text strong style={{ overflowWrap: 'anywhere', whiteSpace: 'normal' }}>
          {modalTitle.title}
        </Text>
        {modalTitle.description && (
          <Text fontSize={12} type={'secondary'}>
            {modalTitle.description}
          </Text>
        )}
      </Flexbox>
    ),
  });
};
