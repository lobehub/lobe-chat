// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { documents, users } from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { DocumentModel } from '../document';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'document-quick-note-source-test-user';
const documentModel = new DocumentModel(serverDB, userId);

beforeEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
  await serverDB.insert(users).values({ id: userId });
  await documentModel.create({
    content: 'Visible document',
    fileType: 'text/markdown',
    filename: 'visible',
    source: 'api',
    sourceType: 'api',
    totalCharCount: 16,
    totalLineCount: 1,
  });
  await documentModel.create({
    content: 'Quick Note source',
    fileType: 'text/markdown',
    filename: 'quick-note',
    source: 'quick-note:qn_1',
    sourceType: 'quick-note',
    totalCharCount: 17,
    totalLineCount: 1,
  });
});

afterEach(async () => {
  await serverDB.delete(documents).where(eq(documents.userId, userId));
  await serverDB.delete(users).where(eq(users.id, userId));
});

describe('DocumentModel.query with Quick Note source documents', () => {
  /** @example Quick Note backing Documents stay out of the default document list. */
  it('excludes Quick Note documents by default', async () => {
    const result = await documentModel.query();

    expect(result.items.map((item) => item.sourceType)).toEqual(['api']);
  });

  /** @example Callers can still request Quick Note documents explicitly. */
  it('returns Quick Note documents when sourceTypes requests them', async () => {
    const result = await documentModel.query({ sourceTypes: ['quick-note'] });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].sourceType).toBe('quick-note');
  });
});
