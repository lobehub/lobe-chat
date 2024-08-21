// @vitest-environment node
import { eq } from 'drizzle-orm';
import { desc } from 'drizzle-orm/expressions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTestDBInstance } from '@/database/server/core/dbForTest';

import { NewKnowledgeBase, knowledgeBases, users } from '../../schemas/lobechat';
import { KnowledgeBaseModel } from '../knowledgeBase';

let serverDB = await getTestDBInstance();

vi.mock('@/database/server/core/db', async () => ({
  get serverDB() {
    return serverDB;
  },
}));

const userId = 'session-group-model-test-user-id';
const knowledgeBaseModel = new KnowledgeBaseModel(userId);

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: 'user2' }]);
});

afterEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
  await serverDB.delete(knowledgeBases).where(eq(knowledgeBases.userId, userId));
});

describe('KnowledgeBaseModel', () => {
  describe('create', () => {
    it('should create a new knowledge base', async () => {
      const params = {
        name: 'Test Group',
      } as NewKnowledgeBase;

      const result = await knowledgeBaseModel.create(params);
      expect(result.id).toBeDefined();
      expect(result).toMatchObject({ ...params, userId });

      const group = await serverDB.query.knowledgeBases.findFirst({
        where: eq(knowledgeBases.id, result.id),
      });
      expect(group).toMatchObject({ ...params, userId });
    });
  });
  describe('delete', () => {
    it('should delete a knowledge base by id', async () => {
      const { id } = await knowledgeBaseModel.create({ name: 'Test Group' });

      await knowledgeBaseModel.delete(id);

      const group = await serverDB.query.knowledgeBases.findFirst({
        where: eq(knowledgeBases.id, id),
      });
      expect(group).toBeUndefined();
    });
  });
  describe('deleteAll', () => {
    it('should delete all knowledge bases for the user', async () => {
      await knowledgeBaseModel.create({ name: 'Test Group 1' });
      await knowledgeBaseModel.create({ name: 'Test Group 2' });

      await knowledgeBaseModel.deleteAll();

      const userGroups = await serverDB.query.knowledgeBases.findMany({
        where: eq(knowledgeBases.userId, userId),
      });
      expect(userGroups).toHaveLength(0);
    });
    it('should only delete knowledge bases for the user, not others', async () => {
      await knowledgeBaseModel.create({ name: 'Test Group 1' });
      await knowledgeBaseModel.create({ name: 'Test Group 333' });

      const anotherSessionGroupModel = new KnowledgeBaseModel('user2');
      await anotherSessionGroupModel.create({ name: 'Test Group 2' });

      await knowledgeBaseModel.deleteAll();

      const userGroups = await serverDB.query.knowledgeBases.findMany({
        where: eq(knowledgeBases.userId, userId),
      });
      const total = await serverDB.query.knowledgeBases.findMany();
      expect(userGroups).toHaveLength(0);
      expect(total).toHaveLength(1);
    });
  });

  describe('query', () => {
    it('should query knowledge bases for the user', async () => {
      await knowledgeBaseModel.create({ name: 'Test Group 1' });
      await knowledgeBaseModel.create({ name: 'Test Group 2' });

      const userGroups = await knowledgeBaseModel.query();
      expect(userGroups).toHaveLength(2);
      expect(userGroups[0].name).toBe('Test Group 2');
      expect(userGroups[1].name).toBe('Test Group 1');
    });
  });

  describe('findById', () => {
    it('should find a knowledge base by id', async () => {
      const { id } = await knowledgeBaseModel.create({ name: 'Test Group' });

      const group = await knowledgeBaseModel.findById(id);
      expect(group).toMatchObject({
        id,
        name: 'Test Group',
        userId,
      });
    });
  });

  describe('update', () => {
    it('should update a knowledge base', async () => {
      const { id } = await knowledgeBaseModel.create({ name: 'Test Group' });

      await knowledgeBaseModel.update(id, { name: 'Updated Test Group' });

      const updatedGroup = await serverDB.query.knowledgeBases.findFirst({
        where: eq(knowledgeBases.id, id),
      });
      expect(updatedGroup).toMatchObject({
        id,
        name: 'Updated Test Group',
        userId,
      });
    });
  });
});
