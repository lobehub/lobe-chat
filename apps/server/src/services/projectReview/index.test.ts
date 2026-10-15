// @vitest-environment node
import { type LobeChatDatabase } from '@lobechat/database';
import {
  acceptances,
  users,
  verifyRuns,
  workspaceMembers,
  workspaces,
} from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ProjectModel } from '@/database/models/project';
import {
  cleanupTestUser,
  createTestUser,
} from '@/server/routers/lambda/__tests__/integration/setup';

import { ProjectReviewService } from './index';

describe('ProjectReviewService', () => {
  let db: LobeChatDatabase;
  let ownerId: string;
  let adminId: string;
  let memberId: string;
  let guestId: string;
  let projectId: string;
  let workspaceId: string;

  const as = (userId: string) => new ProjectReviewService(db, userId);

  beforeEach(async () => {
    db = await getTestDB();
    ownerId = await createTestUser(db);
    adminId = await createTestUser(db);
    memberId = await createTestUser(db);
    guestId = await createTestUser(db);
    await db
      .update(users)
      .set({ email: 'alex@studio-north.co', fullName: 'Alex' })
      .where(eq(users.id, guestId));
    await db.update(users).set({ fullName: 'Innei' }).where(eq(users.id, ownerId));

    const [workspace] = await db
      .insert(workspaces)
      .values({ name: 'Fieldnotes', primaryOwnerId: ownerId, slug: `ws-${ownerId}` })
      .returning();
    workspaceId = workspace.id;
    await db.insert(workspaceMembers).values([
      { role: 'owner', userId: ownerId, workspaceId },
      { role: 'admin', userId: adminId, workspaceId },
      { role: 'member', userId: memberId, workspaceId },
    ]);
    const project = await new ProjectModel(db, ownerId, workspaceId).create({
      identifier: 'SITE',
      name: 'Fieldnotes 官网',
    });
    projectId = project.id;
  });

  afterEach(async () => {
    for (const id of [guestId, memberId, adminId, ownerId]) await cleanupTestUser(db, id);
  });

  describe('sites', () => {
    it('creates a site with normalized origins and a private standing review for it', async () => {
      const site = await as(ownerId).createSite(projectId, {
        name: 'Marketing site',
        origins: ['HTTPS://Fieldnotes.app/', 'https://*.fieldnotes.app'],
      });

      expect(site.origins).toEqual(['https://fieldnotes.app', 'https://*.fieldnotes.app']);
      expect(site.workspaceId).toBe(workspaceId);

      const [acceptance] = await db
        .select()
        .from(acceptances)
        .where(eq(acceptances.id, site.acceptanceId!));
      expect(acceptance).toMatchObject({
        metadata: { title: 'Site review · Marketing site' },
        projectId,
        status: 'delivered',
        subjectId: site.id,
        subjectType: 'site',
        visibility: 'private',
        workspaceId,
      });
      const runs = await db
        .select()
        .from(verifyRuns)
        .where(eq(verifyRuns.acceptanceId, acceptance.id));
      expect(runs).toEqual([
        expect.objectContaining({
          metadata: { previewUrl: 'https://fieldnotes.app' },
          roundIndex: 1,
        }),
      ]);
    });

    it('leaves the preview unset when every origin is a wildcard', async () => {
      const site = await as(ownerId).createSite(projectId, {
        name: 'Previews',
        origins: ['https://*.fieldnotes.app'],
      });
      const runs = await db
        .select()
        .from(verifyRuns)
        .where(eq(verifyRuns.acceptanceId, site.acceptanceId!));
      expect(runs[0].metadata?.previewUrl).toBeUndefined();
    });

    it('rejects an invalid origin and says which one', async () => {
      await expect(
        as(ownerId).createSite(projectId, {
          name: 'Bad',
          origins: ['https://fieldnotes.app', 'https://*.vercel.app'],
        }),
      ).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'invalidOrigin:1:sharedHostWildcard',
      });
    });

    it('renames the standing review with the site and deletes both together', async () => {
      const service = as(ownerId);
      const site = await service.createSite(projectId, {
        name: 'Marketing site',
        origins: ['https://fieldnotes.app'],
      });

      await service.updateSite(site.id, { name: 'Landing pages' });
      const [renamed] = await db
        .select()
        .from(acceptances)
        .where(eq(acceptances.id, site.acceptanceId!));
      expect(renamed.metadata).toMatchObject({ title: 'Site review · Landing pages' });

      await service.deleteSite(site.id);
      expect(await service.listSites(projectId)).toEqual([]);
      expect(
        await db.select().from(acceptances).where(eq(acceptances.id, site.acceptanceId!)),
      ).toEqual([]);
    });

    it('lets a workspace admin manage sites but not a plain member', async () => {
      await expect(
        as(adminId).createSite(projectId, { name: 'A', origins: ['https://a.fieldnotes.app'] }),
      ).resolves.toBeTruthy();
      await expect(
        as(memberId).createSite(projectId, { name: 'B', origins: ['https://b.fieldnotes.app'] }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  describe('members', () => {
    it('links an existing workspace member and lists available members', async () => {
      const service = as(ownerId);
      const member = await service.addMember(projectId, { userId: memberId, role: 'reviewer' });
      const result = await service.listMembers(projectId);
      expect(result.workspaceId).toBe(workspaceId);
      expect(result.owner).toMatchObject({ name: 'Innei' });
      expect(result.members).toEqual([
        expect.objectContaining({ id: member.id, userId: memberId, role: 'reviewer' }),
      ]);
      expect(result.availableMembers.map((person) => person.userId)).toEqual([adminId]);
      expect(result.members[0]).not.toHaveProperty('inviteToken');
      await service.updateMemberRole(member.id, 'maintainer');
      expect((await service.listMembers(projectId)).members[0].role).toBe('maintainer');
      await service.removeMember(member.id);
      expect((await service.listMembers(projectId)).members).toEqual([]);
    });

    it('rejects outsiders and soft-deleted workspace members', async () => {
      await expect(
        as(ownerId).addMember(projectId, { userId: guestId, role: 'reviewer' }),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
      await db
        .update(workspaceMembers)
        .set({ deletedAt: new Date() })
        .where(eq(workspaceMembers.userId, memberId));
      await expect(
        as(ownerId).addMember(projectId, { userId: memberId, role: 'reviewer' }),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
      expect(
        (await as(ownerId).listMembers(projectId)).availableMembers.map((person) => person.userId),
      ).not.toContain(memberId);
    });

    it('does not offer member management on a personal project', async () => {
      const personal = await new ProjectModel(db, ownerId).create({
        identifier: 'MEP',
        name: 'Personal',
      });
      expect(await as(ownerId).listMembers(personal.id)).toMatchObject({
        workspaceId: null,
        members: [],
        availableMembers: [],
      });
      await expect(
        as(ownerId).addMember(personal.id, { userId: memberId, role: 'reviewer' }),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('refuses member management to people who cannot manage the project', async () => {
      await expect(as(memberId).listMembers(projectId)).rejects.toBeInstanceOf(TRPCError);
      await expect(
        as(guestId).addMember(projectId, { userId: memberId, role: 'reviewer' }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('does not let a maintainer change a member of a different project', async () => {
      const service = as(ownerId);
      await service.addMember(projectId, { userId: memberId, role: 'maintainer' });
      const other = await new ProjectModel(db, ownerId, workspaceId).create({
        identifier: 'OTH',
        name: 'Other',
      });
      const otherMember = await service.addMember(other.id, { userId: adminId, role: 'reviewer' });
      await expect(
        as(memberId).updateMemberRole(otherMember.id, 'maintainer'),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(as(memberId).removeMember(otherMember.id)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });
});
