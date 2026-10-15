import { eq } from 'drizzle-orm';

import { ProjectMemberModel } from '@/database/models/projectReview';
import { WorkspaceMemberModel } from '@/database/models/workspaceMember';
import { projects } from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';

export type ProjectReviewScope = Pick<
  typeof projects.$inferSelect,
  'id' | 'name' | 'userId' | 'workspaceId'
>;

export type ProjectReviewRole = 'creator' | 'maintainer' | 'reviewer';

export async function findProjectReviewScope(
  db: LobeChatDatabase,
  projectId: string,
): Promise<ProjectReviewScope | null> {
  const [project] = await db
    .select({
      id: projects.id,
      name: projects.name,
      userId: projects.userId,
      workspaceId: projects.workspaceId,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return project ?? null;
}

export async function resolveProjectReviewRole(
  db: LobeChatDatabase,
  userId: string | null | undefined,
  project: ProjectReviewScope,
): Promise<ProjectReviewRole | null> {
  if (!userId) return null;
  if (project.workspaceId) {
    const teammate = await new WorkspaceMemberModel(db, userId).getMember(
      project.workspaceId,
      userId,
    );
    if (!teammate) return null;
  }
  if (project.userId === userId) return 'creator';
  if (!project.workspaceId) return null;
  const member = await new ProjectMemberModel(db).findActive(project.id, userId);
  return member?.role ?? null;
}

export const canManageProjectReview = async (
  db: LobeChatDatabase,
  userId: string,
  project: ProjectReviewScope,
) => {
  const role = await resolveProjectReviewRole(db, userId, project);
  if (role === 'creator' || role === 'maintainer') return true;
  if (!project.workspaceId) return false;
  const teammate = await new WorkspaceMemberModel(db, userId).getMember(
    project.workspaceId,
    userId,
  );
  return teammate?.role === 'owner' || teammate?.role === 'admin';
};
