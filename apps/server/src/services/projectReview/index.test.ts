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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectModel } from '@/database/models/project';
import {
  cleanupTestUser,
  createTestUser,
} from '@/server/routers/lambda/__tests__/integration/setup';

import { ProjectReviewService } from './index';

const sendMail = vi.hoisted(() => vi.fn());
vi.mock('@/server/services/email', () => ({
  EmailService: class {
    sendMail = sendMail;
  },
}));

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
    sendMail.mockReset().mockResolvedValue({ messageId: 'm1' });
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
    it('invites by email, mails a link and returns it', async () => {
      const result = await as(ownerId).inviteMember(projectId, {
        email: 'alex@studio-north.co',
        role: 'reviewer',
      });

      expect(result.inviteUrl).toMatch(/\/invite\/project\/[\w-]{32,}$/);
      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(result.inviteUrl),
          subject: expect.stringContaining('Fieldnotes 官网'),
          to: 'alex@studio-north.co',
        }),
      );
    });

    it('still returns the link when mail delivery fails', async () => {
      sendMail.mockRejectedValueOnce(new Error('smtp down'));
      await expect(
        as(ownerId).inviteMember(projectId, { email: 'x@y.co', role: 'reviewer' }),
      ).resolves.toMatchObject({ inviteUrl: expect.any(String) });
    });

    it('shows and accepts an invitation for the signed-in invitee', async () => {
      const { inviteUrl } = await as(ownerId).inviteMember(projectId, {
        email: 'alex@studio-north.co',
        role: 'maintainer',
      });
      const token = inviteUrl.split('/').pop()!;

      expect(await as(guestId).getInvite(token)).toEqual({
        email: 'alex@studio-north.co',
        emailMatches: true,
        inviterName: 'Innei',
        projectName: 'Fieldnotes 官网',
        role: 'maintainer',
        status: 'valid',
      });
      expect(await as(memberId).getInvite(token)).toMatchObject({ emailMatches: false });

      await expect(as(guestId).acceptInvite(token)).resolves.toMatchObject({ projectId });
      expect(await as(guestId).getInvite(token)).toEqual({ status: 'notFound' });
    });

    it('lists members with the workspace switch and lets the owner change roles and revoke', async () => {
      const service = as(ownerId);
      const { member } = await service.inviteMember(projectId, {
        email: 'r@x.co',
        role: 'reviewer',
      });

      expect(await service.listMembers(projectId)).toMatchObject({
        members: [
          expect.objectContaining({ email: 'r@x.co', role: 'reviewer', status: 'pending' }),
        ],
        reviewWorkspaceMembers: true,
      });

      await service.updateMemberRole(member.id, 'maintainer');
      await service.setReviewWorkspaceMembers(projectId, false);
      expect(await service.listMembers(projectId)).toMatchObject({
        members: [expect.objectContaining({ role: 'maintainer' })],
        reviewWorkspaceMembers: false,
      });

      await service.revokeMember(member.id);
      expect((await service.listMembers(projectId)).members).toEqual([]);
    });

    it('names the owner and accepted members, flags guests and never exposes invite tokens', async () => {
      const service = as(ownerId);
      const guestInvite = await service.inviteMember(projectId, {
        email: 'alex@studio-north.co',
        role: 'reviewer',
      });
      await as(guestId).acceptInvite(guestInvite.inviteUrl.split('/').pop()!);
      await db.update(users).set({ email: 'm@fieldnotes.app' }).where(eq(users.id, memberId));
      const teammateInvite = await service.inviteMember(projectId, {
        email: 'm@fieldnotes.app',
        role: 'maintainer',
      });
      await as(memberId).acceptInvite(teammateInvite.inviteUrl.split('/').pop()!);
      await service.inviteMember(projectId, { email: 'sam@x.co', role: 'reviewer' });

      const { members, owner } = await service.listMembers(projectId);

      expect(owner).toMatchObject({ name: 'Innei' });
      expect(members).toEqual([
        expect.objectContaining({
          email: 'alex@studio-north.co',
          guest: true,
          status: 'accepted',
          user: expect.objectContaining({ name: 'Alex' }),
        }),
        expect.objectContaining({ email: 'm@fieldnotes.app', guest: false, status: 'accepted' }),
        expect.objectContaining({
          email: 'sam@x.co',
          expiresAt: expect.any(Date),
          guest: false,
          status: 'pending',
          user: null,
        }),
      ]);
      for (const member of members) expect(member).not.toHaveProperty('inviteToken');
    });

    it('refuses member management to people who cannot manage the project', async () => {
      await expect(as(memberId).listMembers(projectId)).rejects.toBeInstanceOf(TRPCError);
      await expect(
        as(guestId).inviteMember(projectId, { email: 'z@z.co', role: 'reviewer' }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });
});
