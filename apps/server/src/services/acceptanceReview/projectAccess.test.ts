// @vitest-environment node
import { randomUUID } from 'node:crypto';

import { type LobeChatDatabase } from '@lobechat/database';
import { acceptances, projects, workspaceMembers, workspaces } from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ProjectModel } from '@/database/models/project';
import { ProjectMemberModel } from '@/database/models/projectReview';
import {
  cleanupTestUser,
  createTestUser,
} from '@/server/routers/lambda/__tests__/integration/setup';
import { resolveAcceptanceCommentAccess } from '@/server/routers/lambda/_helpers/acceptanceCommentAccess';

import { resolveReviewAccess } from './access';
import { resolveProjectReviewRole } from './projectAccess';

describe('site review access', () => {
  let db: LobeChatDatabase;
  let ownerId: string;
  let teammateId: string;
  let viewerId: string;
  let guestId: string;
  let strangerId: string;
  let projectId: string;
  let workspaceId: string;
  let siteAcceptanceId: string;

  const add = (userId: string, role: 'maintainer' | 'reviewer') =>
    new ProjectMemberModel(db).add({ projectId, userId, role });

  const notFound = (userId: string) =>
    expect(resolveAcceptanceCommentAccess(db, userId, siteAcceptanceId)).rejects.toThrow(TRPCError);

  beforeEach(async () => {
    db = await getTestDB();
    ownerId = await createTestUser(db);
    teammateId = await createTestUser(db);
    viewerId = await createTestUser(db);
    guestId = await createTestUser(db);
    strangerId = await createTestUser(db);

    const [workspace] = await db
      .insert(workspaces)
      .values({ name: 'Fieldnotes', primaryOwnerId: ownerId, slug: `ws-${ownerId}` })
      .returning();
    workspaceId = workspace.id;
    await db.insert(workspaceMembers).values([
      { role: 'owner', userId: ownerId, workspaceId },
      { role: 'member', userId: teammateId, workspaceId },
      { role: 'viewer', userId: viewerId, workspaceId },
    ]);

    const project = await new ProjectModel(db, ownerId, workspaceId).create({
      identifier: 'SITE',
      name: 'Fieldnotes site',
    });
    projectId = project.id;

    const [acceptance] = await db
      .insert(acceptances)
      .values({
        projectId,
        subjectId: randomUUID(),
        subjectType: 'site',
        userId: teammateId,
        visibility: 'private',
        workspaceId,
      })
      .returning();
    siteAcceptanceId = acceptance.id;
  });

  afterEach(async () => {
    for (const id of [guestId, strangerId, viewerId, teammateId, ownerId]) {
      await cleanupTestUser(db, id);
    }
  });

  it('gives the project creator full rights even when someone else created the site review', async () => {
    const access = await resolveAcceptanceCommentAccess(db, ownerId, siteAcceptanceId);
    expect(access).toMatchObject({ canApprove: true, canComment: true });
  });

  it('lets a linked workspace reviewer comment but not moderate', async () => {
    await add(teammateId, 'reviewer');
    expect(await resolveAcceptanceCommentAccess(db, teammateId, siteAcceptanceId)).toMatchObject({
      canApprove: false,
      canComment: true,
      memberOfWorkspaceId: workspaceId,
    });
  });

  it('lets a linked maintainer moderate', async () => {
    await add(teammateId, 'maintainer');
    expect(await resolveAcceptanceCommentAccess(db, teammateId, siteAcceptanceId)).toMatchObject({
      canApprove: true,
      canComment: true,
    });
  });

  it('revokes access when the project association is removed', async () => {
    const member = await add(teammateId, 'reviewer');
    await new ProjectMemberModel(db).remove(member!.id);
    await notFound(teammateId);
  });

  it('requires an explicit project association for workspace members', async () => {
    await notFound(teammateId);
    await notFound(viewerId);
    await expect(resolveReviewAccess(db, teammateId, siteAcceptanceId)).resolves.toBeNull();
  });

  it('rejects departed workspace members, including the project creator', async () => {
    await add(teammateId, 'maintainer');
    for (const userId of [teammateId, ownerId]) {
      await db
        .update(workspaceMembers)
        .set({ deletedAt: new Date() })
        .where(
          and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)),
        );
      await notFound(userId);
    }
  });

  it('never opens a site review to strangers, even when it is marked public', async () => {
    await db
      .update(acceptances)
      .set({ visibility: 'public' })
      .where(eq(acceptances.id, siteAcceptanceId));
    await notFound(strangerId);
  });

  it('hides the site review from strangers', async () => {
    await notFound(strangerId);
  });

  it('never offers Accept or Send back on a site review', async () => {
    const access = await resolveReviewAccess(db, ownerId, siteAcceptanceId);
    expect(access?.can).toEqual({ comment: true, decide: false, moderate: true });
  });

  it('names the role each person holds on the project', async () => {
    const project = (await db.select().from(projects).where(eq(projects.id, projectId)))[0];
    await add(teammateId, 'maintainer');

    expect(await resolveProjectReviewRole(db, ownerId, project)).toBe('creator');
    expect(await resolveProjectReviewRole(db, teammateId, project)).toBe('maintainer');
    expect(await resolveProjectReviewRole(db, viewerId, project)).toBeNull();
    expect(await resolveProjectReviewRole(db, strangerId, project)).toBeNull();
  });
});
