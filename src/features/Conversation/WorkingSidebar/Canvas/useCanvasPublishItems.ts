import { type DropdownItem, toast } from '@lobehub/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { openPublishConfirm } from '@/components/PublishConfirmModal';
import { canvasService, type CanvasVersionDetail } from '@/services/canvas';
import { workService } from '@/services/work';

export const useCanvasPublishItems = (
  data: CanvasVersionDetail | null | undefined,
  onPublished: () => unknown,
): DropdownItem[] => {
  const { t } = useTranslation('portal');
  const [publishing, setPublishing] = useState(false);

  if (!data) return [];

  const items: DropdownItem[] = [];
  const publishedUrl = data.publishedUrl;

  if (publishedUrl) {
    items.push({
      key: 'open-public',
      label: t('canvas.menu.openPublic'),
      onClick: () => window.open(publishedUrl, '_blank', 'noopener,noreferrer'),
    });
  }

  if (data.canPublish && (publishing || data.publishedVersion !== data.latestVersion)) {
    const publish = async () => {
      setPublishing(true);
      try {
        const result = await canvasService.publish(data.canvasId);
        await onPublished();
        await workService.refreshAllConversations();
        toast.success(t('canvas.publish.success', { version: result.publishedVersion }));
      } catch (error) {
        console.error('[Canvas] publish failed', error);
        toast.error(t('canvas.publish.failed'));
      } finally {
        setPublishing(false);
      }
    };

    const publishLabel = t(publishedUrl ? 'canvas.menu.updatePublic' : 'canvas.menu.publish', {
      version: data.latestVersion,
    });

    items.push({
      disabled: publishing,
      key: 'publish',
      label: publishing ? t('canvas.menu.publishing') : publishLabel,
      onClick: () =>
        openPublishConfirm({
          note: t('canvas.publish.note'),
          okText: publishLabel,
          onOk: () => void publish(),
        }),
    });
  }

  return items;
};
