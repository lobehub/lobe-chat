import { ActionIconGroupItems } from '@lobehub/ui/es/ActionIconGroup';
import { Copy, Edit, ListRestart, RotateCcw, Trash } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface ChatListActionsBar {
  copy: ActionIconGroupItems;
  del: ActionIconGroupItems;
  delAndRegenerate: ActionIconGroupItems;
  divider: { type: 'divider' };
  edit: ActionIconGroupItems;
  regenerate: ActionIconGroupItems;
}

export const useChatListActionsBar = (): ChatListActionsBar => {
  const { t } = useTranslation('common');

  return useMemo(
    () => ({
      copy: {
        icon: Copy,
        key: 'copy',
        label: t('copy', { defaultValue: 'Copy' }),
      },
      del: {
        danger: true,
        icon: Trash,
        key: 'del',
        label: t('delete', { defaultValue: 'Delete' }),
      },
      delAndRegenerate: {
        icon: ListRestart,
        key: 'delAndRegenerate',
        label: t('messageAction.delAndRegenerate', {
          defaultValue: 'Delete and regenerate',
          ns: 'chat',
        }),
      },
      divider: {
        type: 'divider',
      },
      edit: {
        icon: Edit,
        key: 'edit',
        label: t('edit', { defaultValue: 'Edit' }),
      },
      regenerate: {
        icon: RotateCcw,
        key: 'regenerate',
        label: t('regenerate', { defaultValue: 'Regenerate' }),
      },
    }),
    [],
  );
};
