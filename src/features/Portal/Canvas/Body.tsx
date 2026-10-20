import { createStaticStyles, cssVar, Empty, Flexbox, Skeleton, Text } from '@lobehub/ui';
import { Loader2Icon, PanelsTopLeftIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import CanvasFrame from './CanvasFrame';
import { useAwaitingCanvasSave, useCanvasVersion, useCanvasView } from './useCanvasVersion';
import { usePendingCanvasUpdate } from './usePendingCanvasUpdate';

const styles = createStaticStyles(({ css }) => ({
  body: css`
    position: relative;
    height: 100%;
    min-height: 0;
  `,
  dimmed: css`
    pointer-events: none;
    opacity: 0.45;
    filter: grayscale(1);
    transition: opacity 0.2s ease;
  `,
  pill: css`
    position: absolute;
    z-index: 1;
    inset-block-start: 16px;
    inset-inline-start: 50%;
    transform: translateX(-50%);

    padding-block: 6px;
    padding-inline: 12px;
    border: 1px solid ${cssVar.colorBorder};
    border-radius: 999px;

    background: ${cssVar.colorBgElevated};
    box-shadow: ${cssVar.boxShadowSecondary};
  `,
  spin: css`
    animation: lobe-canvas-spin 1s linear infinite;

    @keyframes lobe-canvas-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
}));

const Body = memo(() => {
  const { t } = useTranslation('portal');
  const view = useCanvasView();
  const { data, isLoading } = useCanvasVersion();
  const pending = usePendingCanvasUpdate(view?.canvasId);
  const awaitingSave = useAwaitingCanvasSave(data?.metadata.manifestKey);
  const showPending =
    (pending || awaitingSave) && (!view?.version || view.version === data?.latestVersion);

  if (isLoading && !data) {
    return (
      <Flexbox gap={16} padding={24}>
        <Skeleton height={24} width={'40%'} />
        <Skeleton height={120} width={'100%'} />
        <Skeleton height={16} width={'80%'} />
        <Skeleton height={16} width={'60%'} />
      </Flexbox>
    );
  }

  if (!data) {
    return <Empty description={t('canvas.notFound')} icon={PanelsTopLeftIcon} />;
  }

  return (
    <Flexbox className={styles.body}>
      {showPending && (
        <Flexbox horizontal align={'center'} className={styles.pill} gap={8}>
          <Loader2Icon className={styles.spin} size={14} />
          <Text fontSize={12}>{t('canvas.generating', { version: data.latestVersion + 1 })}</Text>
        </Flexbox>
      )}
      <Flexbox
        className={showPending ? styles.dimmed : undefined}
        flex={1}
        style={{ minHeight: 0 }}
      >
        <CanvasFrame src={data.previewUrl} />
      </Flexbox>
    </Flexbox>
  );
});

Body.displayName = 'CanvasPortalBody';

export default Body;
