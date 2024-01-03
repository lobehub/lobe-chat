import { ActionIconGroupItems } from '@lobehub/ui/es/ActionIconGroup';
import { Copy, Edit, RotateCw, Trash } from 'lucide-react';

interface ChatListActionsBar {
  copy: ActionIconGroupItems;
  del: ActionIconGroupItems;
  divider: { type: 'divider' };
  edit: ActionIconGroupItems;
  regenerate: ActionIconGroupItems;
}

export const useChatListActionsBar = (text?: {
  copy?: string;
  delete?: string;
  edit?: string;
  regenerate?: string;
}): ChatListActionsBar => {
  return {
    copy: {
      icon: Copy,
      key: 'copy',
      label: text?.copy || 'Copy',
    },
    del: {
      icon: Trash,
      key: 'del',
      label: text?.delete || 'Delete',
    },
    divider: {
      type: 'divider',
    },
    edit: {
      icon: Edit,
      key: 'edit',
      label: text?.edit || 'Edit',
    },
    regenerate: {
      icon: RotateCw,
      key: 'regenerate',
      label: text?.regenerate || 'Regenerate',
    },
  };
};
