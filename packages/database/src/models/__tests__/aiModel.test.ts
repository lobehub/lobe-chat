// @vitest-environment node
import { eq } from 'drizzle-orm';
import { AiProviderModelListItem } from 'model-bank';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AiModelSelectItem, NewAiModelItem, aiModels, users } from '../../schemas';
import { LobeChatDatabase } from '../../type';
import { AiModelModel } from '../aiModel';
import { getTestDB } from './_util';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'ai-model-test-user-id';
const aiProviderModel = new AiModelModel(serverDB, userId);

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: 'user2' }]);
});

afterEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
  await serverDB.delete(aiModels).where(eq(aiModels.userId, userId));
});

describe('AiModelModel', () => {
  describe('create', () => {
    it('should create a new ai provider', async () => {
      const params: NewAiModelItem = {
        organization: 'Qwen',
        id: 'qvq',
        providerId: 'openai',
      };

      const result = await aiProviderModel.create(params);
      expect(result.id).toBeDefined();
      expect(result).toMatchObject({ ...params, userId });

      const group = await serverDB.query.aiModels.findFirst({
        where: eq(aiModels.id, result.id),
      });
      expect(group).toMatchObject({ ...params, userId });
    });
  });
  describe('delete', () => {
    it('should delete a ai provider by id', async () => {
      const { id } = await aiProviderModel.create({
        organization: 'Qwen',
        providerId: 'openai',
        id: 'qvq',
      });

      await aiProviderModel.delete(id, 'openai');

      const group = await serverDB.query.aiModels.findFirst({
        where: eq(aiModels.id, id),
      });
      expect(group).toBeUndefined();
    });
  });
  describe('deleteAll', () => {
    it('should delete all ai providers for the user', async () => {
      await aiProviderModel.create({ organization: 'Qwen', providerId: 'openai', id: 'qvq' });
      await aiProviderModel.create({
        organization: 'Qwen',
        providerId: 'openai',
        id: 'aihubmix-2',
      });

      await aiProviderModel.deleteAll();

      const userGroups = await serverDB.query.aiModels.findMany({
        where: eq(aiModels.userId, userId),
      });
      expect(userGroups).toHaveLength(0);
    });
    it('should only delete ai providers for the user, not others', async () => {
      await aiProviderModel.create({ organization: 'Qwen', providerId: 'openai', id: 'qvq' });
      await aiProviderModel.create({
        organization: 'Qwen',
        providerId: 'openai',
        id: 'aihubmix-2',
      });

      const anotherAiModelModel = new AiModelModel(serverDB, 'user2');
      await anotherAiModelModel.create({ id: 'qvq', providerId: 'openai' });

      await aiProviderModel.deleteAll();

      const userGroups = await serverDB.query.aiModels.findMany({
        where: eq(aiModels.userId, userId),
      });
      const total = await serverDB.query.aiModels.findMany();
      expect(userGroups).toHaveLength(0);
      expect(total).toHaveLength(1);
    });
  });

  describe('query', () => {
    it('should query ai providers for the user', async () => {
      await aiProviderModel.create({ organization: 'Qwen', providerId: 'openai', id: 'qvq' });
      await aiProviderModel.create({
        organization: 'Qwen',
        providerId: 'openai',
        id: 'aihubmix-2',
      });

      const userGroups = await aiProviderModel.query();
      expect(userGroups).toHaveLength(2);
      expect(userGroups[0].id).toBe('aihubmix-2');
      expect(userGroups[1].id).toBe('qvq');
    });
  });

  describe('findById', () => {
    it('should find a ai provider by id', async () => {
      const { id } = await aiProviderModel.create({
        organization: 'Qwen',
        providerId: 'openai',
        id: 'qvq',
      });

      const group = await aiProviderModel.findById(id);
      expect(group).toMatchObject({
        id,
        organization: 'Qwen',
        providerId: 'openai',

        userId,
      });
    });
  });

  describe('update', () => {
    it('should update a ai provider', async () => {
      const { id } = await aiProviderModel.create({
        organization: 'Qwen',
        providerId: 'openai',
        id: 'qvq',
      });

      await aiProviderModel.update(id, 'openai', {
        displayName: 'Updated Test Group',
        contextWindowTokens: 3000,
      });

      const updatedGroup = await serverDB.query.aiModels.findFirst({
        where: eq(aiModels.id, id),
      });
      expect(updatedGroup).toMatchObject({
        id,
        displayName: 'Updated Test Group',
        contextWindowTokens: 3000,
        userId,
      });
    });
  });

  describe('getModelListByProviderId', () => {
    it('should get model list by provider id', async () => {
      await aiProviderModel.create({
        id: 'model1',
        providerId: 'openai',
        sort: 1,
        enabled: true,
      });
      await aiProviderModel.create({
        id: 'model2',
        providerId: 'openai',
        sort: 2,
        enabled: false,
      });

      const models = await aiProviderModel.getModelListByProviderId('openai');
      expect(models).toHaveLength(2);
      expect(models[0].id).toBe('model1');
      expect(models[1].id).toBe('model2');
    });

    it('should only return models for specified provider', async () => {
      await aiProviderModel.create({
        id: 'model1',
        providerId: 'openai',
      });
      await aiProviderModel.create({
        id: 'model2',
        providerId: 'anthropic',
      });

      const models = await aiProviderModel.getModelListByProviderId('openai');
      expect(models).toHaveLength(1);
      expect(models[0].id).toBe('model1');
    });
  });

  describe('getAllModels', () => {
    it('should only return enabled models', async () => {
      await serverDB.insert(aiModels).values([
        { id: 'model1', providerId: 'openai', enabled: true, source: 'custom', userId },
        { id: 'model2', providerId: 'b', enabled: false, source: 'custom', userId },
      ]);

      const models = await aiProviderModel.getAllModels();
      expect(models).toHaveLength(2);
    });
  });

  describe('toggleModelEnabled', () => {
    it('should toggle model enabled status', async () => {
      const model = await aiProviderModel.create({
        id: 'model1',
        providerId: 'openai',
        enabled: true,
      });

      await aiProviderModel.toggleModelEnabled({
        id: model.id,
        providerId: 'openai',
        enabled: false,
      });

      const updatedModel = await aiProviderModel.findById(model.id);
      expect(updatedModel?.enabled).toBe(false);
    });
  });

  describe('batchUpdateAiModels', () => {
    it('should insert new models and update existing ones', async () => {
      // Create an initial model
      await aiProviderModel.create({
        id: 'existing-model',
        providerId: 'openai',
        displayName: 'Old Name',
      });

      const models = [
        {
          id: 'existing-model',
          displayName: 'Updated Name',
        },
        {
          id: 'new-model',
          displayName: 'New Model',
        },
      ] as AiProviderModelListItem[];

      await aiProviderModel.batchUpdateAiModels('openai', models);

      const allModels = await aiProviderModel.query();
      expect(allModels).toHaveLength(2);
      expect(allModels.find((m) => m.id === 'existing-model')?.displayName).toBe('Old Name');
      expect(allModels.find((m) => m.id === 'new-model')?.displayName).toBe('New Model');
    });
  });

  describe('batchToggleAiModels', () => {
    it('should toggle multiple models enabled status', async () => {
      await aiProviderModel.create({
        id: 'model1',
        providerId: 'openai',
        enabled: false,
      });
      await aiProviderModel.create({
        id: 'model2',
        providerId: 'openai',
        enabled: false,
      });

      await aiProviderModel.batchToggleAiModels('openai', ['model1', 'model2'], true);

      const models = await aiProviderModel.query();
      expect(models.every((m) => m.enabled)).toBe(true);
    });
  });

  describe('clearRemoteModels', () => {
    it('should delete all remote models for a provider', async () => {
      await serverDB.insert(aiModels).values([
        { id: 'remote1', providerId: 'openai', source: 'remote', userId },
        { id: 'custom1', providerId: 'openai', source: 'custom', userId },
      ]);

      await aiProviderModel.clearRemoteModels('openai');

      const remainingModels = await aiProviderModel.query();
      expect(remainingModels).toHaveLength(1);
      expect(remainingModels[0].id).toBe('custom1');
    });
  });

  describe('updateModelsOrder', () => {
    it('should update the sort order of models', async () => {
      await aiProviderModel.create({
        id: 'model1',
        providerId: 'openai',
        sort: 1,
      });
      await aiProviderModel.create({
        id: 'model2',
        providerId: 'openai',
        sort: 2,
      });

      const sortMap = [
        { id: 'model1', sort: 2 },
        { id: 'model2', sort: 1 },
      ];

      await aiProviderModel.updateModelsOrder('openai', sortMap);

      const models = await aiProviderModel.getModelListByProviderId('openai');
      expect(models[0].id).toBe('model2');
      expect(models[1].id).toBe('model1');
    });
  });
});
