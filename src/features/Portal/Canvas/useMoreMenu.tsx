import type { DropdownItem } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import { type PortalMoreMenuConfig } from '@/features/Portal/components/PortalMoreMenu/types';
import { useChatStore } from '@/store/chat';

import { useCanvasPublishItems } from './useCanvasPublishItems';
import { useCanvasVersion, useCanvasVersions, useCanvasView } from './useCanvasVersion';

export const useCanvasMoreMenu = (): PortalMoreMenuConfig | undefined => {
  const { t } = useTranslation('portal');
  const view = useCanvasView();
  const { data, mutate } = useCanvasVersion();
  const { data: versions } = useCanvasVersions(view?.canvasId);
  const openCanvas = useChatStore((s) => s.openCanvas);
  const publishItems = useCanvasPublishItems(data, () => mutate());

  if (!view || !data) return;

  const extraItems: DropdownItem[] = [
    ...publishItems,
    {
      key: 'open-in-tab',
      label: t('canvas.menu.openInTab'),
      onClick: () => window.open(data.previewUrl, '_blank', 'noopener,noreferrer'),
    },
  ];

  if (versions && versions.length > 1) {
    extraItems.unshift({
      children: versions.map((item) => ({
        key: `v${item.version}`,
        label: t('canvas.menu.versionItem', {
          date: new Date(item.createdAt).toLocaleString(),
          version: item.version,
        }),
        onClick: () => openCanvas(view.canvasId, item.version),
      })),
      key: 'versions',
      label: t('canvas.menu.versions'),
    });
  }

  return {
    copyId: view.canvasId,
    copyLink: data.publishedUrl ?? undefined,
    extraItems,
    refresh: () => mutate(),
  };
};
