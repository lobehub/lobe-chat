// @vitest-environment node
import { randomUUID } from 'node:crypto';

import { type LobeChatDatabase } from '@lobechat/database';
import {
  acceptances,
  projects,
  users,
  workspaceMembers,
  workspaces,
} from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
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

  const invite = async (userId: string, email: string, role: 'maintainer' | 'reviewer') => {
    await db.update(users).set({ email }).where(eq(users.id, userId));
    const members = new ProjectMemberModel(db);
    const pending = await members.invite({ email, projectId, role });
    await members.accept(pending.inviteToken!, { email, userId });
    return pending;
  };

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

  it('lets an invited reviewer outside the workspace comment but not moderate', async () => {
    await invite(guestId, 'alex@studio-north.co', 'reviewer');
    const access = await resolveAcceptanceCommentAccess(db, guestId, siteAcceptanceId);
    expect(access).toMatchObject({ canApprove: false, canComment: true });
  });

  it('lets an invited maintainer moderate', async () => {
    await invite(guestId, 'alex@studio-north.co', 'maintainer');
    const access = await resolveAcceptanceCommentAccess(db, guestId, siteAcceptanceId);
    expect(access).toMatchObject({ canApprove: true, canComment: true });
  });

  it('treats pending and revoked invites as no access', async () => {
    const members = new ProjectMemberModel(db);
    await members.invite({ email: 'pending@x.co', projectId, role: 'reviewer' });
    await notFound(strangerId);

    const accepted = await invite(guestId, 'alex@studio-north.co', 'reviewer');
    await members.revoke(accepted.id);
    await notFound(guestId);
  });

  it('lets non-viewer workspace members review only while the project switch is on', async () => {
    const access = await resolveAcceptanceCommentAccess(db, teammateId, siteAcceptanceId);
    expect(access.canComment).toBe(true);

    const other = await createTestUser(db);
    await db.insert(workspaceMembers).values({ role: 'member', userId: other, workspaceId });
    await db
      .update(projects)
      .set({ reviewWorkspaceMembers: false })
      .where(eq(projects.id, projectId));
    await notFound(other);
    await cleanupTestUser(db, other);
  });

  it('keeps a workspace viewer out of a site review', async () => {
    await notFound(viewerId);
  });

  it('takes access away from the person who created the site once the switch is off', async () => {
    await db
      .update(projects)
      .set({ reviewWorkspaceMembers: false })
      .where(eq(projects.id, projectId));
    await notFound(teammateId);
    await expect(resolveReviewAccess(db, teammateId, siteAcceptanceId)).resolves.toBeNull();
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
    await invite(guestId, 'alex@studio-north.co', 'maintainer');

    expect(await resolveProjectReviewRole(db, ownerId, project)).toBe('creator');
    expect(await resolveProjectReviewRole(db, guestId, project)).toBe('maintainer');
    expect(await resolveProjectReviewRole(db, teammateId, project)).toBe('workspace');
    expect(await resolveProjectReviewRole(db, viewerId, project)).toBeNull();
    expect(await resolveProjectReviewRole(db, strangerId, project)).toBeNull();
  });
});
