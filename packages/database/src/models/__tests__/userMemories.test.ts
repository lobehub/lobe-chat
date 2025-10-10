// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { userMemories, users } from '../../schemas';
import { LobeChatDatabase } from '../../type';
import { UserMemoryModel } from '../userMemory';
import { getTestDB } from './_util';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'user-memory-model-test-user-id';
const userMemoryModel = new UserMemoryModel(serverDB, userId);

const mockEmbedding = Array(1024)
  .fill(0)
  .map((_, i) => (i % 2 === 0 ? 1.0 : 0.0));
const mockEmbedding2 = Array(1024)
  .fill(0)
  .map((_, i) => (i % 3 === 0 ? 1.0 : 0.0));

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: 'user2' }]);
});

afterEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
});

describe('UserMemoryModel', () => {
  describe('create', () => {
    it('should create a new user memory with required fields', async () => {
      const params = {
        title: 'Test Memory',
        summary: 'This is a test memory summary',
        summaryVector1024: mockEmbedding,
      };

      const result = await userMemoryModel.create(params);

      expect(result.id).toBeDefined();
      expect(result.title).toBe(params.title);
      expect(result.summary).toBe(params.summary);
      expect(result.userId).toBe(userId);
      expect(result.accessedCount).toBe(0);
      expect(result.lastAccessedAt).toBeDefined();
    });

    it('should create a user memory with all optional fields', async () => {
      const params = {
        title: 'Complete Memory',
        summary: 'Complete memory summary',
        summaryVector1024: mockEmbedding,
        details: 'Detailed information about the memory',
        detailsVector1024: mockEmbedding2,
        memoryCategory: 'personal',
        memoryLayer: 'surface',
        memoryType: 'factual',
      };

      const result = await userMemoryModel.create(params);

      expect(result).toMatchObject({
        title: params.title,
        summary: params.summary,
        details: params.details,
        memoryCategory: params.memoryCategory,
        memoryLayer: params.memoryLayer,
        memoryType: params.memoryType,
        userId,
      });
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      // Create test memories
      await userMemoryModel.create({
        title: 'Travel Memory',
        summary: 'Trip to Japan last year',
        summaryVector1024: mockEmbedding,
        memoryType: 'experience',
        memoryCategory: 'travel',
      });

      await userMemoryModel.create({
        title: 'Work Memory',
        summary: 'Project completion milestone',
        summaryVector1024: mockEmbedding2,
        memoryType: 'achievement',
        memoryCategory: 'work',
      });
    });

    it('should search without embedding (fallback to recent)', async () => {
      const results = await userMemoryModel.search({
        limit: 5,
      });

      expect(results).toHaveLength(2);
      expect(results[0].relevanceScore).toBe(1); // Default relevance score
      expect(results.every((r) => r.id && r.title && r.summary)).toBe(true);
    });

    it('should filter by memory type', async () => {
      const results = await userMemoryModel.search({
        memoryType: 'experience',
        limit: 5,
      });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Travel Memory');
    });

    it('should filter by memory category', async () => {
      const results = await userMemoryModel.search({
        memoryCategory: 'work',
        limit: 5,
      });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Work Memory');
    });

    it('should limit results correctly', async () => {
      const results = await userMemoryModel.search({
        limit: 1,
      });

      expect(results).toHaveLength(1);
    });
  });

  describe('searchWithEmbedding', () => {
    beforeEach(async () => {
      await userMemoryModel.create({
        title: 'Similar Memory',
        summary: 'This should match the embedding',
        summaryVector1024: mockEmbedding,
        memoryType: 'test',
      });

      await userMemoryModel.create({
        title: 'Different Memory',
        summary: 'This should be less similar',
        summaryVector1024: mockEmbedding2,
        memoryType: 'test',
      });
    });

    it('should perform semantic search with embedding', async () => {
      const results = await userMemoryModel.searchWithEmbedding({
        embedding: mockEmbedding,
        limit: 5,
      });

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('Similar Memory');
      expect(results[1]).toBeDefined();
      expect(results[0].relevanceScore).toBeDefined();
      expect(results[0].relevanceScore).toBeGreaterThan(results[1].relevanceScore!);
    });

    it('should filter by memory type with embedding', async () => {
      const results = await userMemoryModel.searchWithEmbedding({
        embedding: mockEmbedding,
        memoryType: 'test',
        limit: 5,
      });

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.title?.includes('Memory'))).toBe(true);
    });

    it('should filter by memory category with embedding', async () => {
      await userMemoryModel.create({
        title: 'Category Test',
        summary: 'Test with category',
        summaryVector1024: mockEmbedding,
        memoryCategory: 'specific',
      });

      const results = await userMemoryModel.searchWithEmbedding({
        embedding: mockEmbedding,
        memoryCategory: 'specific',
        limit: 5,
      });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Category Test');
    });

    it('should update access metrics after search', async () => {
      const beforeSearch = await serverDB.query.userMemories.findMany({
        where: eq(userMemories.userId, userId),
      });
      const initialAccessCount = beforeSearch[0].accessedCount;
      expect(initialAccessCount).toBeDefined();

      await userMemoryModel.searchWithEmbedding({
        embedding: mockEmbedding,
        limit: 1,
      });

      const afterSearch = await serverDB.query.userMemories.findMany({
        where: eq(userMemories.userId, userId),
        orderBy: (table, { desc }) => [desc(table.lastAccessedAt)],
      });

      expect(afterSearch[0].accessedCount).toBe(initialAccessCount! + 1);
      expect(afterSearch[0].lastAccessedAt.getTime()).toBeGreaterThan(
        beforeSearch[0].lastAccessedAt.getTime(),
      );
    });
  });

  describe('findById', () => {
    it('should find a memory by id', async () => {
      const created = await userMemoryModel.create({
        title: 'Find Test',
        summary: 'Memory to find by ID',
        summaryVector1024: mockEmbedding,
      });

      const found = await userMemoryModel.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find Test');
    });

    it('should return undefined for non-existent id', async () => {
      const found = await userMemoryModel.findById('non-existent-id');
      expect(found).toBeUndefined();
    });

    it('should not find memory from another user', async () => {
      const anotherUserModel = new UserMemoryModel(serverDB, 'user2');
      const created = await anotherUserModel.create({
        title: 'Another User Memory',
        summary: 'Should not be accessible',
        summaryVector1024: mockEmbedding,
      });

      const found = await userMemoryModel.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should update access metrics when found', async () => {
      const created = await userMemoryModel.create({
        title: 'Access Test',
        summary: 'Test access metrics',
        summaryVector1024: mockEmbedding,
      });

      const initialAccessCount = created.accessedCount;
      const initialAccessedAt = created.lastAccessedAt;
      expect(initialAccessCount).toBeDefined();
      expect(initialAccessedAt).toBeDefined();

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await userMemoryModel.findById(created.id);

      const updated = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, created.id),
      });

      expect(updated?.accessedCount).toBe(initialAccessCount! + 1);
      expect(updated?.lastAccessedAt.getTime()).toBeGreaterThan(initialAccessedAt.getTime());
    });
  });

  describe('update', () => {
    it('should update memory fields', async () => {
      const created = await userMemoryModel.create({
        title: 'Original Title',
        summary: 'Original summary',
        summaryVector1024: mockEmbedding,
      });

      await userMemoryModel.update(created.id, {
        title: 'Updated Title',
        summary: 'Updated summary',
        details: 'Added details',
      });

      const updated = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, created.id),
      });

      expect(updated?.title).toBe('Updated Title');
      expect(updated?.summary).toBe('Updated summary');
      expect(updated?.details).toBe('Added details');
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('should only update own user memories', async () => {
      const anotherUserModel = new UserMemoryModel(serverDB, 'user2');
      const created = await anotherUserModel.create({
        title: 'Another User Memory',
        summary: 'Should not be updatable',
        summaryVector1024: mockEmbedding,
      });

      await userMemoryModel.update(created.id, {
        title: 'Attempted Update',
      });

      const unchanged = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, created.id),
      });

      expect(unchanged?.title).toBe('Another User Memory');
    });
  });

  describe('delete', () => {
    it('should delete a memory by id', async () => {
      const created = await userMemoryModel.create({
        title: 'To Delete',
        summary: 'This will be deleted',
        summaryVector1024: mockEmbedding,
      });

      await userMemoryModel.delete(created.id);

      const deleted = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, created.id),
      });

      expect(deleted).toBeUndefined();
    });

    it('should only delete own user memories', async () => {
      const anotherUserModel = new UserMemoryModel(serverDB, 'user2');
      const created = await anotherUserModel.create({
        title: 'Another User Memory',
        summary: 'Should not be deletable',
        summaryVector1024: mockEmbedding,
      });

      await userMemoryModel.delete(created.id);

      const stillExists = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, created.id),
      });

      expect(stillExists).toBeDefined();
    });
  });

  describe('deleteAll', () => {
    it('should delete all memories for the user', async () => {
      await userMemoryModel.create({
        title: 'Memory 1',
        summary: 'First memory',
        summaryVector1024: mockEmbedding,
      });

      await userMemoryModel.create({
        title: 'Memory 2',
        summary: 'Second memory',
        summaryVector1024: mockEmbedding2,
      });

      await userMemoryModel.deleteAll();

      const remaining = await serverDB.query.userMemories.findMany({
        where: eq(userMemories.userId, userId),
      });

      expect(remaining).toHaveLength(0);
    });

    it('should only delete memories for the user, not others', async () => {
      await userMemoryModel.create({
        title: 'User 1 Memory',
        summary: 'Will be deleted',
        summaryVector1024: mockEmbedding,
      });

      const anotherUserModel = new UserMemoryModel(serverDB, 'user2');
      await anotherUserModel.create({
        title: 'User 2 Memory',
        summary: 'Should remain',
        summaryVector1024: mockEmbedding,
      });

      await userMemoryModel.deleteAll();

      const user1Remaining = await serverDB.query.userMemories.findMany({
        where: eq(userMemories.userId, userId),
      });
      const user2Remaining = await serverDB.query.userMemories.findMany({
        where: eq(userMemories.userId, 'user2'),
      });

      expect(user1Remaining).toHaveLength(0);
      expect(user2Remaining).toHaveLength(1);
    });
  });

  describe('getByCategory', () => {
    beforeEach(async () => {
      await userMemoryModel.create({
        title: 'Travel Memory 1',
        summary: 'Japan trip',
        summaryVector1024: mockEmbedding,
        memoryCategory: 'travel',
      });

      await userMemoryModel.create({
        title: 'Travel Memory 2',
        summary: 'Europe trip',
        summaryVector1024: mockEmbedding2,
        memoryCategory: 'travel',
      });

      await userMemoryModel.create({
        title: 'Work Memory',
        summary: 'Project completion',
        summaryVector1024: mockEmbedding,
        memoryCategory: 'work',
      });
    });

    it('should get memories by category', async () => {
      const travelMemories = await userMemoryModel.getByCategory('travel');

      expect(travelMemories).toHaveLength(2);
      expect(travelMemories.every((m) => m.memoryCategory === 'travel')).toBe(true);
    });

    it('should return memories ordered by last accessed date', async () => {
      const memories = await userMemoryModel.getByCategory('travel');

      expect(memories[0].lastAccessedAt.getTime()).toBeGreaterThanOrEqual(
        memories[1].lastAccessedAt.getTime(),
      );
    });
  });

  describe('getByType', () => {
    beforeEach(async () => {
      await userMemoryModel.create({
        title: 'Experience 1',
        summary: 'Learning experience',
        summaryVector1024: mockEmbedding,
        memoryType: 'experience',
      });

      await userMemoryModel.create({
        title: 'Experience 2',
        summary: 'Another experience',
        summaryVector1024: mockEmbedding2,
        memoryType: 'experience',
      });

      await userMemoryModel.create({
        title: 'Factual Memory',
        summary: 'Some facts',
        summaryVector1024: mockEmbedding,
        memoryType: 'factual',
      });
    });

    it('should get memories by type', async () => {
      const experienceMemories = await userMemoryModel.getByType('experience');

      expect(experienceMemories).toHaveLength(2);
      expect(experienceMemories.every((m) => m.memoryType === 'experience')).toBe(true);
    });

    it('should return memories ordered by last accessed date', async () => {
      const memories = await userMemoryModel.getByType('experience');

      expect(memories[0].lastAccessedAt.getTime()).toBeGreaterThanOrEqual(
        memories[1].lastAccessedAt.getTime(),
      );
    });
  });

  describe('categorizeContext', () => {
    let baseMemory: Awaited<ReturnType<typeof userMemoryModel.create>>;

    beforeEach(async () => {
      baseMemory = await userMemoryModel.create({
        title: 'Project Note',
        summary: 'Details about a shared project',
        summaryVector1024: mockEmbedding,
      });
    });

    it('should create a new context for owned memories', async () => {
      const result = await userMemoryModel.categorizeContext({
        currentStatus: 'planning',
        title: 'Project Alpha',
        type: 'project',
        userMemoryIds: [baseMemory.id],
      });

      expect(result.created).toBe(true);
      expect(result.context.title).toBe('Project Alpha');
      expect(result.context.currentStatus).toBe('planning');
      const ids = Array.isArray(result.context.userMemoryIds) ? result.context.userMemoryIds : [];
      expect(ids).toContain(baseMemory.id);
    });

    it('should update an existing context when contextId is provided', async () => {
      const created = await userMemoryModel.categorizeContext({
        title: 'Context Beta',
        userMemoryIds: [baseMemory.id],
      });

      const updated = await userMemoryModel.categorizeContext({
        contextId: created.context.id,
        currentStatus: 'active',
        scoreImpact: 0.9,
        userMemoryIds: [baseMemory.id],
      });

      expect(updated.created).toBe(false);
      expect(updated.context.currentStatus).toBe('active');
      expect(updated.context.scoreImpact).toBeCloseTo(0.9);
    });

    it('should reject contexts referencing memories from another user', async () => {
      const anotherUserModel = new UserMemoryModel(serverDB, 'user2');
      const otherMemory = await anotherUserModel.create({
        title: 'Other user memory',
        summary: 'Belongs to another user',
        summaryVector1024: mockEmbedding,
      });

      await expect(
        userMemoryModel.categorizeContext({
          title: 'Invalid Context',
          userMemoryIds: [otherMemory.id],
        }),
      ).rejects.toThrow('Memory IDs must belong to the current user');
    });

    it('should reject when no memory ids provided', async () => {
      await expect(
        userMemoryModel.categorizeContext({
          title: 'Empty Context',
          userMemoryIds: [],
        }),
      ).rejects.toThrow('At least one userMemoryId must be provided');
    });

    it('should throw when context does not exist on update', async () => {
      await expect(
        userMemoryModel.categorizeContext({
          contextId: 'non-existent-context',
          title: 'Should fail',
          userMemoryIds: [baseMemory.id],
        }),
      ).rejects.toThrow('Context not found');
    });
  });

  describe('categorizePreference', () => {
    let baseMemory: Awaited<ReturnType<typeof userMemoryModel.create>>;
    let baseContextId: string;

    beforeEach(async () => {
      baseMemory = await userMemoryModel.create({
        title: 'Preference Source',
        summary: 'Important behavioral signal',
        summaryVector1024: mockEmbedding,
      });

      const context = await userMemoryModel.categorizeContext({
        title: 'Shared Context',
        type: 'relationship',
        userMemoryIds: [baseMemory.id],
      });

      baseContextId = context.context.id;
    });

    it('should create a preference linked to a context', async () => {
      const result = await userMemoryModel.categorizePreference({
        conclusionDirectives: 'Provide weekly summaries every Friday',
        contextId: baseContextId,
        type: 'communication',
      });

      expect(result.created).toBe(true);
      expect(result.preference.contextId).toBe(baseContextId);
      expect(result.preference.conclusionDirectives).toContain('weekly summaries');
    });

    it('should update an existing preference when preferenceId is set', async () => {
      const created = await userMemoryModel.categorizePreference({
        conclusionDirectives: 'Send summary emails',
        contextId: baseContextId,
        type: 'communication',
      });

      const updated = await userMemoryModel.categorizePreference({
        preferenceId: created.preference.id,
        contextId: baseContextId,
        scorePriority: 0.75,
        suggestions: 'Draft on Thursday',
        userMemoryId: baseMemory.id,
      });

      expect(updated.created).toBe(false);
      expect(updated.preference.scorePriority).toBeCloseTo(0.75);
      expect(updated.preference.userMemoryId).toBe(baseMemory.id);
      expect(updated.preference.suggestions).toBe('Draft on Thursday');
    });

    it('should reject preferences referencing another user memory', async () => {
      const anotherUserModel = new UserMemoryModel(serverDB, 'user2');
      const otherMemory = await anotherUserModel.create({
        title: 'Other user memory',
        summary: 'Belongs to another user',
        summaryVector1024: mockEmbedding,
      });

      await expect(
        userMemoryModel.categorizePreference({
          conclusionDirectives: 'Invalid preference',
          userMemoryId: otherMemory.id,
        }),
      ).rejects.toThrow('Memory IDs must belong to the current user');
    });

    it('should create preference without explicit context or memory linkage', async () => {
      const result = await userMemoryModel.categorizePreference({
        conclusionDirectives: 'Record standalone preference',
        type: 'general',
      });

      expect(result.created).toBe(true);
      expect(result.preference.contextId ?? null).toBeNull();
      expect(result.preference.userMemoryId ?? null).toBeNull();
      expect(result.preference.conclusionDirectives).toBe('Record standalone preference');
    });

    it('should reject when specified context belongs to another user', async () => {
      const anotherUserModel = new UserMemoryModel(serverDB, 'user2');
      const otherMemory = await anotherUserModel.create({
        title: 'Other memory',
        summary: 'Different owner',
        summaryVector1024: mockEmbedding,
      });

      const otherContext = await anotherUserModel.categorizeContext({
        title: 'Other Context',
        userMemoryIds: [otherMemory.id],
      });

      await expect(
        userMemoryModel.categorizePreference({
          conclusionDirectives: 'Cross-user reference',
          contextId: otherContext.context.id,
        }),
      ).rejects.toThrow('Memory IDs must belong to the current user');
    });

    it('should throw when attempting to update a non-existent preference', async () => {
      await expect(
        userMemoryModel.categorizePreference({
          preferenceId: 'missing-preference',
          conclusionDirectives: 'Should fail',
        }),
      ).rejects.toThrow('Preference not found');
    });
  });

  describe('edge cases', () => {
    it('should handle empty search results', async () => {
      const results = await userMemoryModel.search({
        memoryCategory: 'non-existent-category',
        limit: 5,
      });

      expect(results).toHaveLength(0);
    });

    it('should handle search with zero limit', async () => {
      const results = await userMemoryModel.search({ limit: 0 });
      expect(results).toHaveLength(0);
    });

    it('should handle null/undefined values in search', async () => {
      await userMemoryModel.create({
        title: 'Test Memory',
        summary: 'Test summary',
        summaryVector1024: mockEmbedding,
        // memoryCategory and memoryType are null/undefined
      });

      const results = await userMemoryModel.search({ limit: 5 });
      expect(results).toHaveLength(1);
      expect(results[0].memoryCategory).toBeUndefined();
      expect(results[0].memoryType).toBeUndefined();
    });
  });
});
