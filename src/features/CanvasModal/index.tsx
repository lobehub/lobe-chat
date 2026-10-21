'use client';

import { createModal, Empty } from '@lobehub/ui';
import { t } from 'i18next';

import AsyncBoundary from '@/components/AsyncBoundary';
import CanvasFrame from '@/features/Conversation/WorkingSidebar/Canvas/CanvasFrame';
import { useClientDataSWR } from '@/libs/swr';
import { canvasService } from '@/services/canvas';

interface CanvasModalProps {
  canvasId: string;
  version?: number;
}

const CanvasModalContent = ({ canvasId, version }: CanvasModalProps) => {
  const { data, error, isLoading, mutate } = useClientDataSWR(
    ['canvas-modal-version', canvasId, version ?? 'latest'],
    () => canvasService.getVersion(canvasId, version),
  );

  return (
    <AsyncBoundary
      data={data}
      empty={<Empty description={t('canvas.notFound', { ns: 'portal' })} />}
      error={error}
      isEmpty={data === null}
      isLoading={isLoading}
      onRetry={() => {
        void mutate();
      }}
    >
      {data && <CanvasFrame canvasId={data.canvasId} version={data.version} />}
    </AsyncBoundary>
  );
};

export const createCanvasModal = (canvasId: string, version?: number) =>
  createModal({
    content: <CanvasModalContent canvasId={canvasId} version={version} />,
    footer: null,
    maskClosable: true,
    styles: { content: { display: 'flex', height: '75vh', minHeight: 0, padding: 0 } },
    title: t('canvas.frameTitle', { ns: 'portal' }),
    width: 'min(95vw, 1200px)',
  });
