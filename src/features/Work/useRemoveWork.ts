import type { WorkListBaseItem } from '@lobechat/types';
import { confirmModal, toast } from '@lobehub/ui/base-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { workService } from '@/services/work';

/**
 * User-initiated removal of a Work card. Intended for orphaned Works (the
 * backing task / document is gone, so the user cannot clear the card by
 * deleting the resource itself — see LOBE-13917). Confirms first because the
 * delete cascades the Work's version history and any project pins.
 */
export const useRemoveWork = () => {
  const { t } = useTranslation(['chat', 'common']);

  return useCallback(
    (item: Pick<WorkListBaseItem, 'id'>) => {
      confirmModal({
        cancelText: t('cancel', { ns: 'common' }),
        content: t('workingPanel.works.removeConfirm', { ns: 'chat' }),
        okButtonProps: { danger: true },
        okText: t('delete', { ns: 'common' }),
        onOk: async () => {
          try {
            await workService.deleteWork(item.id);
            // The orphan may be surfaced in the gallery, the sidebar and any
            // message it was registered from, so refresh every Work view.
            await workService.refreshAllConversations();
          } catch (error) {
            console.error('[useRemoveWork] failed to delete work', error);
            toast.error(t('operationFailed', { ns: 'common' }));
          }
        },
        title: t('workingPanel.works.remove', { ns: 'chat' }),
      });
    },
    [t],
  );
};
