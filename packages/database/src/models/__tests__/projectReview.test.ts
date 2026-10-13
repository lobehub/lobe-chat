import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { projectMembers, users } from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { ProjectModel } from '../project';
import { ProjectMemberModel, ProjectSiteModel } from '../projectReview';

const serverDB: LobeChatDatabase = await getTestDB();
const ownerId = 'project-review-owner';
const guestId = 'project-review-guest';

const createProject = () =>
  new ProjectModel(serverDB, ownerId).create({ identifier: 'SITE', name: 'Fieldnotes' });

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([
    { email: 'owner@fieldnotes.app', id: ownerId },
    { email: 'alex@studio-north.co', id: guestId },
  ]);
});

afterEach(async () => {
  await serverDB.delete(users);
});

describe('ProjectSiteModel', () => {
  const sites = new ProjectSiteModel(serverDB);

  it('creates a site with a public key and finds it by that key', async () => {
    const project = await createProject();
    const site = await sites.create({
      createdByUserId: ownerId,
      name: 'Marketing site',
      origins: ['https://fieldnotes.app'],
      projectId: project.id,
    });

    expect(site.siteKey).toMatch(/^site_\w{12}$/);
    expect(await sites.findBySiteKey(site.siteKey)).toEqual(
      expect.objectContaining({ id: site.id, projectId: project.id }),
    );
    expect(await sites.findBySiteKey('site_missing')).toBeNull();
  });

  it('lists, updates and deletes the sites of one project', async () => {
    const project = await createProject();
    const site = await sites.create({
      name: 'Staging',
      origins: ['https://staging.fieldnotes.app'],
      projectId: project.id,
    });

    expect(await sites.listByProject(project.id)).toEqual([
      expect.objectContaining({ id: site.id }),
    ]);

    const updated = await sites.update(site.id, {
      name: 'Preview',
      origins: ['http://localhost:3000'],
    });
    expect(updated).toEqual(
      expect.objectContaining({ name: 'Preview', origins: ['http://localhost:3000'] }),
    );

    await sites.delete(site.id);
    expect(await sites.listByProject(project.id)).toEqual([]);
  });
});

describe('ProjectMemberModel', () => {
  const members = new ProjectMemberModel(serverDB);

  it('invites by normalized email with an unguessable token that expires in 7 days', async () => {
    const project = await createProject();
    const invite = await members.invite({
      email: ' Alex@Studio-North.co ',
      invitedByUserId: ownerId,
      projectId: project.id,
      role: 'reviewer',
    });

    expect(invite).toEqual(
      expect.objectContaining({
        email: 'alex@studio-north.co',
        role: 'reviewer',
        status: 'pending',
      }),
    );
    expect(invite.inviteToken).toMatch(/^[\w-]{32,}$/);
    const days = (invite.expiresAt!.getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThanOrEqual(7);
  });

  it('re-inviting a pending email refreshes the same row instead of duplicating it', async () => {
    const project = await createProject();
    const first = await members.invite({
      email: 'a@x.co',
      projectId: project.id,
      role: 'reviewer',
    });
    const second = await members.invite({
      email: 'A@x.co',
      projectId: project.id,
      role: 'maintainer',
    });

    expect(second.id).toBe(first.id);
    expect(second.role).toBe('maintainer');
    expect(second.inviteToken).not.toBe(first.inviteToken);
    expect(await members.listByProject(project.id)).toHaveLength(1);
  });

  it('accepts an invite only for the invited email, once, before it expires', async () => {
    const project = await createProject();
    const invite = await members.invite({
      email: 'alex@studio-north.co',
      projectId: project.id,
      role: 'reviewer',
    });

    expect(
      await members.accept(invite.inviteToken!, { email: 'someone@else.co', userId: ownerId }),
    ).toEqual({ ok: false, reason: 'emailMismatch' });

    const accepted = await members.accept(invite.inviteToken!, {
      email: 'ALEX@studio-north.co',
      userId: guestId,
    });
    expect(accepted).toEqual({
      member: expect.objectContaining({ status: 'accepted', userId: guestId }),
      ok: true,
    });
    expect(await members.findActive(project.id, guestId)).toEqual(
      expect.objectContaining({ role: 'reviewer' }),
    );
    expect(
      await members.accept(invite.inviteToken!, { email: 'alex@studio-north.co', userId: guestId }),
    ).toEqual({ ok: false, reason: 'notFound' });
  });

  it('refuses an expired invite', async () => {
    const project = await createProject();
    const invite = await members.invite({
      email: 'late@x.co',
      projectId: project.id,
      role: 'reviewer',
    });
    await serverDB.update(projectMembers).set({ expiresAt: new Date(Date.now() - 1000) });

    expect(
      await members.accept(invite.inviteToken!, { email: 'late@x.co', userId: guestId }),
    ).toEqual({
      ok: false,
      reason: 'expired',
    });
  });

  it('revoking removes access and frees the email for a new invite', async () => {
    const project = await createProject();
    const invite = await members.invite({
      email: 'alex@studio-north.co',
      projectId: project.id,
      role: 'maintainer',
    });
    await members.accept(invite.inviteToken!, { email: 'alex@studio-north.co', userId: guestId });

    await members.revoke(invite.id);
    expect(await members.findActive(project.id, guestId)).toBeNull();
    expect(await members.listByProject(project.id)).toEqual([]);

    const again = await members.invite({
      email: 'alex@studio-north.co',
      projectId: project.id,
      role: 'reviewer',
    });
    expect(again.id).not.toBe(invite.id);
  });

  it('changes a member role', async () => {
    const project = await createProject();
    const invite = await members.invite({
      email: 'r@x.co',
      projectId: project.id,
      role: 'reviewer',
    });
    expect(await members.updateRole(invite.id, 'maintainer')).toEqual(
      expect.objectContaining({ role: 'maintainer' }),
    );
  });
});
