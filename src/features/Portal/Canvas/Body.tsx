import { Empty, Flexbox, Skeleton, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { Loader2Icon, PanelsTopLeftIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import CanvasFrame from './CanvasFrame';
import { useAwaitingCanvasSave, useCanvasVersion, useCanvasView } from './useCanvasVersion';
import { usePendingCanvasUpdate } from './usePendingCanvasUpdate';

const spin = stylex.keyframes({
  to: { transform: 'rotate(360deg)' },
});

const styles = stylex.create({
  body: {
    height: '100%',
    minHeight: 0,
    position: 'relative',
  },
  content: {
    minHeight: 0,
  },
  dimmed: {
    filter: 'grayscale(1)',
    opacity: 0.45,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease',
  },
  pill: {
    backgroundColor: cssVar.colorBgElevated,
    borderColor: cssVar.colorBorder,
    borderRadius: 999,
    borderStyle: 'solid',
    borderWidth: 1,
    boxShadow: cssVar.boxShadowSecondary,
    insetBlockStart: 16,
    insetInlineStart: '50%',
    paddingBlock: 6,
    paddingInline: 12,
    position: 'absolute',
    transform: 'translateX(-50%)',
    zIndex: 1,
  },
  spin: {
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationName: spin,
    animationTimingFunction: 'linear',
  },
});

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
    <Flexbox {...stylex.props(styles.body)}>
      {showPending && (
        <Flexbox horizontal align={'center'} gap={8} {...stylex.props(styles.pill)}>
          <Loader2Icon size={14} {...stylex.props(styles.spin)} />
          <Text fontSize={12}>{t('canvas.generating', { version: data.latestVersion + 1 })}</Text>
        </Flexbox>
      )}
      <Flexbox flex={1} {...stylex.props(styles.content, showPending && styles.dimmed)}>
        <CanvasFrame src={data.previewUrl} />
      </Flexbox>
    </Flexbox>
  );
});

Body.displayName = 'CanvasPortalBody';

export default Body;
