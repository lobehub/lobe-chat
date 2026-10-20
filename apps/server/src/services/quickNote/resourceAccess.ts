import type { LobeChatDatabase } from '@/database/type';
import { canPerformResourceAction, getResourceMeta } from '@/server/services/resourcePermission';
import { resolveWorkspaceGrantedPermissions } from '@/server/services/workspacePermission';

const isDocumentReference = (type: string) => type === 'document' || type === 'page';

/**
 * Drops Document and Page references the caller may not view in the current workspace.
 *
 * Use when:
 * - Linking resources to a Quick Note, or returning the links it holds.
 *
 * Expects:
 * - The database layer still checks workspace and visibility; this adds the workspace RBAC
 *   (`DOCUMENT_READ`) and per-Document access level that only the server can evaluate.
 * - Personal scope needs no extra check: the database already limits it to the caller's rows.
 *
 * Returns:
 * - The references the caller may view, in their original order.
 */
export const filterViewableResources = async <T>(
  params: { db: LobeChatDatabase; userId: string; workspaceId?: string },
  references: T[],
  select: (reference: T) => { id: string; type: string },
): Promise<T[]> => {
  const { db, userId, workspaceId } = params;
  if (!workspaceId || !references.some((item) => isDocumentReference(select(item).type))) {
    return references;
  }

  const grantedPermissions = await resolveWorkspaceGrantedPermissions({ db, userId, workspaceId });
  const viewable = await Promise.all(
    references.map(async (item) => {
      const { id, type } = select(item);
      if (!isDocumentReference(type)) return true;

      const meta = await getResourceMeta(db, 'document', id);
      if (!meta) return false;

      return canPerformResourceAction({
        action: 'view',
        db,
        grantedPermissions,
        meta,
        resourceId: id,
        resourceType: 'document',
        userId,
        workspaceId,
      });
    }),
  );

  return references.filter((_, index) => viewable[index]);
};
