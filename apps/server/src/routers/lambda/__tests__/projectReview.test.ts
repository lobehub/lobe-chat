// @vitest-environment node
import { type LobeChatDatabase } from '@lobechat/database';
import { getTestDB } from '@lobechat/database/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectModel } from '@/database/models/project';

import { projectReviewRouter } from '../projectReview';
import { cleanupTestUser, createTestUser } from './integration/setup';

let testDB: LobeChatDatabase;
vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(() => testDB),
}));
vi.mock('@/server/services/email', () => ({
  EmailService: class {
    sendMail = vi.fn().mockResolvedValue({});
  },
}));

describe('projectReviewRouter', () => {
  let ownerId: string;
  let strangerId: string;
  let projectId: string;

  const caller = (userId: string) =>
    projectReviewRouter.createCaller({ jwtPayload: { userId }, userId } as any);

  beforeEach(async () => {
    testDB = await getTestDB();
    ownerId = await createTestUser(testDB);
    strangerId = await createTestUser(testDB);
    projectId = (
      await new ProjectModel(testDB, ownerId).create({ identifier: 'SITE', name: 'Fieldnotes' })
    ).id;
  });

  afterEach(async () => {
    await cleanupTestUser(testDB, strangerId);
    await cleanupTestUser(testDB, ownerId);
  });

  it('creates and lists sites for a manager', async () => {
    const site = await caller(ownerId).createSite({
      name: 'Marketing site',
      origins: ['https://fieldnotes.app'],
      projectId,
    });
    expect(site.siteKey).toMatch(/^site_/);
    expect(await caller(ownerId).listSites({ projectId })).toEqual([
      expect.objectContaining({ id: site.id }),
    ]);
  });

  it('invites a member and toggles workspace access', async () => {
    const { member } = await caller(ownerId).inviteMember({
      email: 'alex@studio-north.co',
      projectId,
      role: 'reviewer',
    });
    await caller(ownerId).updateMemberRole({ id: member.id, role: 'maintainer' });
    await caller(ownerId).setReviewWorkspaceMembers({ enabled: false, projectId });
    expect(await caller(ownerId).listMembers({ projectId })).toMatchObject({
      members: [expect.objectContaining({ role: 'maintainer' })],
      reviewWorkspaceMembers: false,
    });
  });

  it('refuses a stranger', async () => {
    await expect(caller(strangerId).listSites({ projectId })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('rejects an unknown role', async () => {
    await expect(
      caller(ownerId).inviteMember({ email: 'a@b.co', projectId, role: 'owner' as any }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
