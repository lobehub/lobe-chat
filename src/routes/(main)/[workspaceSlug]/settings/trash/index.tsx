'use client';

import { useFetchWorkspaceMembers } from '@/business/client/hooks/useFetchWorkspaceMembers';
import TrashSetting from '@/features/Settings/trash';

/**
 * Recycle bin mirrored under `/:workspaceSlug/settings/trash`. The list,
 * restore and purge already run in the active workspace scope (the server
 * shows owners every root and members only what they deleted); the workspace
 * shell renders the compact header, so the page header is hidden. Members are
 * loaded so each row can name who deleted it.
 */
const WorkspaceTrashSetting = () => {
  useFetchWorkspaceMembers();

  return <TrashSetting showDeletedBy showSettingHeader={false} />;
};

WorkspaceTrashSetting.displayName = 'WorkspaceTrashSetting';

export default WorkspaceTrashSetting;
