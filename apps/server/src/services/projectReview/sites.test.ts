// @vitest-environment node
import { type LobeChatDatabase } from '@lobechat/database';
import { getTestDB } from '@lobechat/database/test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ProjectModel } from '@/database/models/project';
import { ProjectSiteModel } from '@/database/models/projectReview';
import {
  cleanupTestUser,
  createTestUser,
} from '@/server/routers/lambda/__tests__/integration/setup';

import { findSiteForOrigin } from './sites';

describe('findSiteForOrigin', () => {
  let db: LobeChatDatabase;
  let ownerId: string;
  let siteKey: string;

  beforeEach(async () => {
    db = await getTestDB();
    ownerId = await createTestUser(db);
    const project = await new ProjectModel(db, ownerId).create({ identifier: 'SITE', name: 'F' });
    const site = await new ProjectSiteModel(db).create({
      name: 'Marketing',
      origins: ['https://fieldnotes.app', 'https://*.fieldnotes.app'],
      projectId: project.id,
    });
    siteKey = site.siteKey;
  });

  afterEach(async () => {
    await cleanupTestUser(db, ownerId);
  });

  it('returns the site when the origin is registered, exactly or by wildcard', async () => {
    expect(await findSiteForOrigin(db, siteKey, 'https://fieldnotes.app')).toMatchObject({
      siteKey,
    });
    expect(await findSiteForOrigin(db, siteKey, 'https://pr-3.fieldnotes.app')).toMatchObject({
      siteKey,
    });
  });

  it('returns null for an unregistered origin or an unknown key', async () => {
    expect(await findSiteForOrigin(db, siteKey, 'https://fieldnotes-mirror.net')).toBeNull();
    expect(await findSiteForOrigin(db, 'site_000000000000', 'https://fieldnotes.app')).toBeNull();
    expect(await findSiteForOrigin(db, siteKey, undefined)).toBeNull();
  });
});
