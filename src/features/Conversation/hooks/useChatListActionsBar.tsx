import { ActionIconGroupItems } from '@lobehub/ui/es/ActionIconGroup';
import { Copy, Edit, ListRestart, RotateCcw, Split, Trash } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { isServerMode } from '@/const/version';

interface ChatListActionsBar {
  branching: ActionIconGroupItems;
  copy: ActionIconGroupItems;
  del: ActionIconGroupItems;
  delAndRegenerate: ActionIconGroupItems;
  divider: { type: 'divider' };
  edit: ActionIconGroupItems;
  regenerate: ActionIconGroupItems;
}

export const useChatListActionsBar = ({
  hasThread,
}: { hasThread?: boolean } = {}): ChatListActionsBar => {
  const { t } = useTranslation('common');

  return useMemo(
    () => ({
      branching: {
        disable: !isServerMode,
        icon: Split,
        key: 'branching',
        label: isServerMode
          ? t('branching', { defaultValue: 'Create Sub Topic' })
          : t('branchingDisable'),
      },
      copy: {
        icon: Copy,
        key: 'copy',
        label: t('copy', { defaultValue: 'Copy' }),
      },
      del: {
        danger: true,
        disable: hasThread,
        icon: Trash,
        key: 'del',
        label: hasThread ? t('messageAction.deleteDisabledByThreads', { ns: 'chat' }) : t('delete'),
      },
      delAndRegenerate: {
        disable: hasThread,
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
    [hasThread],
  );
};
