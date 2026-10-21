// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { documents, knowledgeBases, users, workspaces } from '../../schemas';
import type { LobeChatDatabase } from '../../type';
import { DocumentModel } from '../document';

const serverDB: LobeChatDatabase = await getTestDB();

const userA = 'doc-query-filters-user-a';
const userB = 'doc-query-filters-user-b';

let workspaceId = '';

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userA }, { id: userB }]);
  const [ws] = await serverDB
    .insert(workspaces)
    .values({ name: 'doc-query-filters-ws', primaryOwnerId: userA, slug: 'doc-query-filters-ws' })
    .returning();
  workspaceId = ws.id;
  await serverDB.insert(knowledgeBases).values({
    id: 'kb-query-filters',
    name: 'KB',
    userId: userA,
    visibility: 'public',
    workspaceId,
  });
});

afterEach(async () => {
  await serverDB.delete(documents);
  await serverDB.delete(knowledgeBases);
  await serverDB.delete(workspaces);
  await serverDB.delete(users);
});

const insertPage = async (params: {
  id: string;
  knowledgeBaseId?: string;
  userId: string;
  visibility: 'private' | 'public';
}) => {
  await serverDB.insert(documents).values({
    fileType: 'custom/document',
    id: params.id,
    knowledgeBaseId: params.knowledgeBaseId ?? null,
    source: 'document',
    sourceType: 'api',
    title: params.id,
    totalCharCount: 0,
    totalLineCount: 0,
    userId: params.userId,
    visibility: params.visibility,
    workspaceId,
  });
};

const queryIds = async (userId: string, params: Parameters<DocumentModel['query']>[0]) => {
  const result = await new DocumentModel(serverDB, userId, workspaceId).query(params);
  return { ids: result.items.map((item) => item.id).sort(), total: result.total };
};

describe('DocumentModel.query — creator / standaloneOnly filters', () => {
  beforeEach(async () => {
    await insertPage({ id: 'a-standalone', userId: userA, visibility: 'public' });
    await insertPage({ id: 'a-private', userId: userA, visibility: 'private' });
    await insertPage({
      id: 'a-in-kb',
      knowledgeBaseId: 'kb-query-filters',
      userId: userA,
      visibility: 'public',
    });
    await insertPage({ id: 'b-standalone', userId: userB, visibility: 'public' });
    await insertPage({ id: 'b-private', userId: userB, visibility: 'private' });
    await insertPage({
      id: 'b-in-kb',
      knowledgeBaseId: 'kb-query-filters',
      userId: userB,
      visibility: 'public',
    });
  });

  it("lists the caller's own standalone pages for creator=self", async () => {
    expect(await queryIds(userA, { creator: 'self', standaloneOnly: true })).toEqual({
      ids: ['a-private', 'a-standalone'],
      total: 2,
    });
  });

  it("lists other members' public standalone pages for creator=others", async () => {
    expect(await queryIds(userA, { creator: 'others', standaloneOnly: true })).toEqual({
      ids: ['b-standalone'],
      total: 1,
    });
  });

  it('keeps knowledge-base pages when standaloneOnly is not set', async () => {
    expect(await queryIds(userA, { creator: 'self' })).toEqual({
      ids: ['a-in-kb', 'a-private', 'a-standalone'],
      total: 3,
    });
  });

  it('applies no creator narrowing by default', async () => {
    expect(await queryIds(userA, { standaloneOnly: true })).toEqual({
      ids: ['a-private', 'a-standalone', 'b-standalone'],
      total: 3,
    });
  });
});
