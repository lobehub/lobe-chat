// @vitest-environment node
import type { LobeChatDatabase } from '@lobechat/database';
import { projectSites, users } from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectModel } from '@/database/models/project';
import { ProjectMemberModel } from '@/database/models/projectReview';
import {
  cleanupTestUser,
  createTestUser,
} from '@/server/routers/lambda/__tests__/integration/setup';
import { ProjectReviewService } from '@/server/services/projectReview';

let serverDB: LobeChatDatabase;

vi.mock('@/database/core/db-adaptor', () => ({ getServerDB: async () => serverDB }));
vi.mock('@/libs/oidc-provider/jwt', () => ({
  verifyAcceptanceReviewJWT: async (token: string) => {
    const [userId, siteKey, origin] = token.split('|');
    if (!origin) throw new Error('invalid');
    return { expiresAt: 2_000_000_000, site: { origin, siteKey }, userId };
  },
}));
vi.mock('@/server/services/email', () => ({
  EmailService: class {
    sendMail = vi.fn().mockResolvedValue({});
  },
}));
vi.mock('@/server/workflows/expertiseRejection', () => ({
  ExpertiseRejectionWorkflow: { trigger: vi.fn() },
}));

const { default: app } = await import('../index');

const BASE = 'http://localhost/api/acceptance-review/v1';
const ORIGIN = 'https://fieldnotes.app';

describe('site review tokens', () => {
  let ownerId: string;
  let guestId: string;
  let projectId: string;
  let site: { acceptanceId: string | null; id: string; siteKey: string };

  const call = (userId: string, path: string, origin = ORIGIN, tokenOrigin = ORIGIN) =>
    app.request(`${BASE}${path}`, {
      headers: {
        authorization: `Bearer ${userId}|${site.siteKey}|${tokenOrigin}`,
        origin,
      },
    });

  beforeEach(async () => {
    serverDB = await getTestDB();
    ownerId = await createTestUser(serverDB);
    guestId = await createTestUser(serverDB);
    await serverDB.update(users).set({ fullName: 'Innei' }).where(eq(users.id, ownerId));
    await serverDB
      .update(users)
      .set({ email: 'alex@studio-north.co' })
      .where(eq(users.id, guestId));
    projectId = (
      await new ProjectModel(serverDB, ownerId).create({
        identifier: 'SITE',
        name: 'Fieldnotes 官网',
      })
    ).id;
    site = await new ProjectReviewService(serverDB, ownerId).createSite(projectId, {
      name: 'Marketing site',
      origins: [ORIGIN],
    });
  });

  afterEach(async () => {
    await cleanupTestUser(serverDB, guestId);
    await cleanupTestUser(serverDB, ownerId);
  });

  it('opens the standing review with project, site and role, and never offers a decision', async () => {
    const response = await call(ownerId, '/session');
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      acceptance: { id: site.acceptanceId, title: 'Site review · Marketing site' },
      can: { comment: true, decide: false, moderate: true },
      project: { id: projectId, name: 'Fieldnotes 官网' },
      role: 'creator',
      site: { key: site.siteKey, name: 'Marketing site' },
    });
  });

  it('rejects a request from another origin than the one the token was issued for', async () => {
    const response = await call(ownerId, '/session', 'https://fieldnotes-mirror.net');
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: { code: 'FORBIDDEN' } });
  });

  it('reads a site that no longer lists the origin as gone', async () => {
    await serverDB
      .update(projectSites)
      .set({ origins: ['https://other.fieldnotes.app'] })
      .where(eq(projectSites.id, site.id));
    const response = await call(ownerId, '/session');
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: { code: 'SITE_GONE' } });
  });

  it('cuts a revoked member off on the next request', async () => {
    const members = new ProjectMemberModel(serverDB);
    const invite = await members.invite({
      email: 'alex@studio-north.co',
      projectId,
      role: 'reviewer',
    });
    await members.accept(invite.inviteToken!, { email: 'alex@studio-north.co', userId: guestId });
    expect((await call(guestId, '/session')).status).toBe(200);

    await members.revoke(invite.id);
    const response = await call(guestId, '/session');
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: { code: 'SITE_ACCESS_REVOKED' } });
  });

  it('names a site publicly for the connect pill and hides unknown keys', async () => {
    const response = await app.request(`${BASE}/sites/${site.siteKey}`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      name: 'Marketing site',
      project: { name: 'Fieldnotes 官网' },
    });
    expect((await app.request(`${BASE}/sites/site_000000000000`)).status).toBe(404);
  });
});
