import { useCallback } from 'react';

import { useIsWorkspaceAdmin } from '@/business/client/hooks/useIsWorkspaceAdmin';
import { usePermission } from '@/hooks/usePermission';
import { useResourceManageableChecker } from '@/hooks/useResourceManageable';

export type TaskArchiveDeniedKey =
  | 'taskList.contextMenu.archiveBlocked'
  | 'taskList.contextMenu.archiveDenied.noEditPermission'
  | 'taskList.contextMenu.archiveDenied.notCreatorOrAdmin';

export interface TaskArchiveGate {
  allowed: boolean;
  /** Locale key explaining why the archive action is disabled. */
  reasonKey?: TaskArchiveDeniedKey;
}

export interface TaskArchiveGateOptions {
  /** Archiving (not restoring) a task whose run, schedule or heartbeat is still live. */
  archiveBlocked?: boolean;
}

/**
 * Archive follows the rule the server enforces: the task's creator, a
 * workspace owner, or a workspace admin, and never while work can still run.
 * The returned reason lets a disabled menu item say why instead of just
 * greying out.
 */
export const useTaskArchiveGate = (): ((
  createdByUserId?: string | null,
  options?: TaskArchiveGateOptions,
) => TaskArchiveGate) => {
  const { allowed: canEditTask } = usePermission('create_content');
  const isAdmin = useIsWorkspaceAdmin();
  const checkManageable = useResourceManageableChecker();

  return useCallback(
    (createdByUserId, options): TaskArchiveGate => {
      if (!canEditTask)
        return { allowed: false, reasonKey: 'taskList.contextMenu.archiveDenied.noEditPermission' };
      if (!isAdmin && !checkManageable(createdByUserId))
        return {
          allowed: false,
          reasonKey: 'taskList.contextMenu.archiveDenied.notCreatorOrAdmin',
        };
      if (options?.archiveBlocked)
        return { allowed: false, reasonKey: 'taskList.contextMenu.archiveBlocked' };
      return { allowed: true };
    },
    [canEditTask, checkManageable, isAdmin],
  );
};
