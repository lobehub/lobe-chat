import { Copy, Edit, RotateCw, Trash } from 'lucide-react';
export var useChatListActionsBar = function useChatListActionsBar(text) {
  return {
    copy: {
      icon: Copy,
      key: 'copy',
      label: (text === null || text === void 0 ? void 0 : text.copy) || 'Copy'
    },
    del: {
      icon: Trash,
      key: 'del',
      label: (text === null || text === void 0 ? void 0 : text.delete) || 'Delete'
    },
    divider: {
      type: 'divider'
    },
    edit: {
      icon: Edit,
      key: 'edit',
      label: (text === null || text === void 0 ? void 0 : text.edit) || 'Edit'
    },
    regenerate: {
      icon: RotateCw,
      key: 'regenerate',
      label: (text === null || text === void 0 ? void 0 : text.regenerate) || 'Regenerate'
    }
  };
};