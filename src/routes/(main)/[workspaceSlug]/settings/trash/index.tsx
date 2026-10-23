'use client';

import TrashSetting from '@/features/Settings/trash';

/**
 * Recycle bin mirrored under `/:workspaceSlug/settings/trash`. The list,
 * restore and purge already run in the active workspace scope (the server
 * shows owners every root and members only what they deleted); the workspace
 * shell renders the compact header, so the page header is hidden.
 */
const WorkspaceTrashSetting = () => <TrashSetting showSettingHeader={false} />;

WorkspaceTrashSetting.displayName = 'WorkspaceTrashSetting';

export default WorkspaceTrashSetting;
