import type { DropdownItem } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import { type PortalMoreMenuConfig } from '@/features/Portal/components/PortalMoreMenu/types';
import { type CanvasVersionDetail } from '@/services/canvas';
import { useChatStore } from '@/store/chat';

import { useCanvasPublishItems } from './useCanvasPublishItems';
import { type CanvasTabView, useCanvasVersions } from './useCanvasVersion';

export const useCanvasMoreMenu = (
  view: CanvasTabView,
  data: CanvasVersionDetail | null | undefined,
  refresh: () => unknown,
): PortalMoreMenuConfig | undefined => {
  const { t } = useTranslation('portal');
  const { data: versions } = useCanvasVersions(view.canvasId);
  const openCanvas = useChatStore((s) => s.openCanvas);
  const publishItems = useCanvasPublishItems(data, refresh);

  if (!data) return;

  const extraItems: DropdownItem[] = [...publishItems];

  if (versions && versions.length > 1) {
    extraItems.unshift({
      children: versions.map((item) => ({
        key: `v${item.version}`,
        label: t('canvas.menu.versionItem', {
          date: new Date(item.createdAt).toLocaleString(),
          version: item.version,
        }),
        onClick: () =>
          openCanvas(view.canvasId, item.version === data.latestVersion ? undefined : item.version),
      })),
      key: 'versions',
      label: t('canvas.menu.versions'),
    });
  }

  return {
    copyId: view.canvasId,
    copyLink: data.publishedUrl ?? undefined,
    extraItems,
    refresh,
  };
};
