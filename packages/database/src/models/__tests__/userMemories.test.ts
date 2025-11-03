// @vitest-environment node
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { idGenerator } from '@/database/utils/idGenerator';
import { LayersEnum, MergeStrategyEnum, TypesEnum } from '@/types/userMemory';

import {
  userMemories,
  userMemoriesContexts,
  userMemoriesExperiences,
  userMemoriesIdentities,
  userMemoriesPreferences,
  users,
} from '../../schemas';
import { LobeChatDatabase } from '../../type';
import {
  BaseCreateUserMemoryParams,
  CreateUserMemoryContextParams,
  CreateUserMemoryExperienceParams,
  CreateUserMemoryIdentityParams,
  CreateUserMemoryPreferenceParams,
  UserMemoryModel,
} from '../userMemory';
import { getTestDB } from './_util';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = idGenerator('user');
const userId2 = idGenerator('user');
const userMemoryModel = new UserMemoryModel(serverDB, userId);

/**
 * Generate a random normalized embedding vector
 * @param dimensions - Vector dimensions (default: 1024)
 * @returns Normalized random vector
 */
function generateRandomEmbedding(dimensions: number = 1024): number[] {
  const vector = Array(dimensions)
    .fill(0)
    .map(() => Math.random() * 2 - 1); // Random values between -1 and 1

  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / magnitude);
}

const mockEmbedding = generateRandomEmbedding();
const mockEmbedding2 = generateRandomEmbedding();

// Assert that two numeric vectors are equal within a precision tolerance
function expectVectorToBeClose(
  actual: number[] | null | undefined,
  expected: number[],
  precision: number = 5,
) {
  expect(actual).toBeDefined();
  expect(actual).not.toBeNull();

  const actualVector = actual as number[];

  expect(actualVector.length).toBe(expected.length);
  actualVector.forEach((value, index) => {
    expect(value).toBeCloseTo(expected[index]!, precision);
  });
}

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: userId2 }]);
});

afterEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
});

function generateRandomCreateUserMemoryParams(
  memoryLayer: BaseCreateUserMemoryParams['memoryLayer'],
): BaseCreateUserMemoryParams {
  return {
    title: 'title ' + nanoid(),
    summary: 'summary ' + nanoid(),
    summaryEmbedding: generateRandomEmbedding(),
    memoryType: TypesEnum.Activity,
    memoryCategory: 'category',
    memoryLayer,
    details: 'details ' + nanoid(),
  } satisfies BaseCreateUserMemoryParams;
}

function generateRandomCreateUserMemoryExperienceParams() {
  return {
    ...generateRandomCreateUserMemoryParams(LayersEnum.Experience),
    experience: {
      action: 'action ' + nanoid(),
      actionVector: generateRandomEmbedding(),
      keyLearning: 'keyLearning ' + nanoid(),
      keyLearningVector: generateRandomEmbedding(),
      metadata: {},
      possibleOutcome: 'possibleOutcome ' + nanoid(),
      reasoning: 'reasoning ' + nanoid(),
      scoreConfidence: 0.5,
      situation: 'situation ' + nanoid(),
      situationVector: generateRandomEmbedding(),
      tags: [],
      type: 'learning',
    },
  } as CreateUserMemoryExperienceParams;
}

function generateRandomCreateUserMemoryIdentityParams() {
  const relationshipOptions = ['self', 'friend', 'colleague', 'other'];

  return {
    ...generateRandomCreateUserMemoryParams(LayersEnum.Identity),
    identity: {
      description: 'identity description ' + nanoid(),
      descriptionVector: generateRandomEmbedding(),
      episodicDate: new Date(),
      metadata: {},
      relationship: relationshipOptions[Math.floor(Math.random() * relationshipOptions.length)],
      role: 'role ' + nanoid(),
      tags: [],
      type: 'personal',
    },
  } as CreateUserMemoryIdentityParams;
}

function generateRandomCreateUserMemoryContextParams() {
  return {
    ...generateRandomCreateUserMemoryParams(LayersEnum.Context),
    context: {
      associatedObjects: [],
      associatedSubjects: [],
      currentStatus: 'status ' + nanoid(),
      description: 'context description ' + nanoid(),
      descriptionVector: generateRandomEmbedding(),
      metadata: {},
      scoreImpact: 0.5,
      scoreUrgency: 0.4,
      tags: [],
      title: 'context title ' + nanoid(),
      titleVector: generateRandomEmbedding(),
      type: 'environment',
      userMemoryIds: [],
    },
  } as CreateUserMemoryContextParams;
}

function generateRandomCreateUserMemoryPreferenceParams() {
  return {
    ...generateRandomCreateUserMemoryParams(LayersEnum.Preference),
    preference: {
      conclusionDirectives: 'directive ' + nanoid(),
      conclusionDirectivesVector: generateRandomEmbedding(),
      metadata: {},
      scorePriority: 0.7,
      suggestions: 'suggestions ' + nanoid(),
      tags: [],
      type: 'choice',
    },
  } as CreateUserMemoryPreferenceParams;
}

describe('UserMemoryModel', () => {
  describe('delete', () => {
    it('should delete a memory by id', async () => {
      const created = await userMemoryModel.create(
        generateRandomCreateUserMemoryExperienceParams(),
      );

      await userMemoryModel.delete(created.id);

      const deleted = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, created.id),
      });

      expect(deleted).toBeUndefined();
    });

    it('should only delete own user memories', async () => {
      const anotherUserModel = new UserMemoryModel(serverDB, userId2);
      const created = await anotherUserModel.create(
        generateRandomCreateUserMemoryExperienceParams(),
      );

      await userMemoryModel.delete(created.id);

      const stillExists = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, created.id),
      });

      expect(stillExists).toBeDefined();
    });
  });

  describe('deleteAll', () => {
    it('should delete all memories for the user', async () => {
      await userMemoryModel.create(generateRandomCreateUserMemoryExperienceParams());
      await userMemoryModel.create(generateRandomCreateUserMemoryIdentityParams());
      await userMemoryModel.create(generateRandomCreateUserMemoryContextParams());
      await userMemoryModel.create(generateRandomCreateUserMemoryPreferenceParams());
      await userMemoryModel.deleteAll();

      const remaining = await serverDB.query.userMemories.findMany({
        where: eq(userMemories.userId, userId),
      });

      expect(remaining).toHaveLength(0);
    });

    it('should only delete memories for the user, not others', async () => {
      // user 2
      const user2Memory = await userMemoryModel.create(
        generateRandomCreateUserMemoryExperienceParams(),
      );
      await serverDB
        .update(userMemories)
        .set({ userId: userId2 })
        .where(eq(userMemories.id, user2Memory.id));

      await userMemoryModel.create(generateRandomCreateUserMemoryIdentityParams());
      await userMemoryModel.create(generateRandomCreateUserMemoryContextParams());
      await userMemoryModel.create(generateRandomCreateUserMemoryPreferenceParams());
      await userMemoryModel.deleteAll();

      const user1Remaining = await serverDB.query.userMemories.findMany({
        where: eq(userMemories.userId, userId),
      });
      const user2Remaining = await serverDB.query.userMemories.findMany({
        where: eq(userMemories.userId, userId2),
      });

      expect(user1Remaining).toHaveLength(0);
      expect(user2Remaining).toHaveLength(1);
    });
  });

  describe('search', () => {
    it('should return layered results with split limits', async () => {
      const experienceMemoryOne = await userMemoryModel.create(
        generateRandomCreateUserMemoryExperienceParams(),
      );
      await serverDB.insert(userMemoriesExperiences).values({
        ...generateRandomCreateUserMemoryExperienceParams().experience,
        userId,
        userMemoryId: experienceMemoryOne.id,
      });

      const experienceMemoryTwo = await userMemoryModel.create(
        generateRandomCreateUserMemoryExperienceParams(),
      );
      await serverDB.insert(userMemoriesExperiences).values({
        ...generateRandomCreateUserMemoryExperienceParams().experience,
        userId,
        userMemoryId: experienceMemoryTwo.id,
      });

      const preferenceMemoryOne = await userMemoryModel.create(
        generateRandomCreateUserMemoryPreferenceParams(),
      );
      await serverDB.insert(userMemoriesPreferences).values({
        ...generateRandomCreateUserMemoryPreferenceParams().preference,
        userId,
        userMemoryId: preferenceMemoryOne.id,
      });

      const preferenceMemoryTwo = await userMemoryModel.create(
        generateRandomCreateUserMemoryPreferenceParams(),
      );
      await serverDB.insert(userMemoriesPreferences).values({
        ...generateRandomCreateUserMemoryPreferenceParams().preference,
        userId,
        userMemoryId: preferenceMemoryTwo.id,
      });

      await serverDB.insert(userMemoriesContexts).values({
        ...generateRandomCreateUserMemoryContextParams().context,
        userId,
        userMemoryIds: [experienceMemoryOne.id, preferenceMemoryOne.id],
      });
      await serverDB.insert(userMemoriesContexts).values({
        ...generateRandomCreateUserMemoryContextParams().context,
        userId,
        userMemoryIds: [experienceMemoryTwo.id, preferenceMemoryTwo.id],
      });

      const result = await userMemoryModel.search({
        limit: 5,
        limits: {
          contexts: 1,
          experiences: 1,
          preferences: 1,
        },
      });

      expect(result.experiences).toHaveLength(1);
      expect(result.preferences).toHaveLength(1);
      expect(result.contexts).toHaveLength(1);
    });
  });

  describe('update vector methods', () => {
    it('updates base user memory vectors', async () => {
      const memoryId = idGenerator('memory');
      await serverDB.insert(userMemories).values({
        details: 'details',
        id: memoryId,
        lastAccessedAt: new Date(),
        summary: 'summary',
        title: 'title',
        userId,
      });

      const summaryVector = generateRandomEmbedding();
      const detailsVector = generateRandomEmbedding();

      await userMemoryModel.updateUserMemoryVectors(memoryId, {
        detailsVector1024: detailsVector,
        summaryVector1024: summaryVector,
      });

      const updated = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, memoryId),
      });

      expectVectorToBeClose(updated?.summaryVector1024, summaryVector);
      expectVectorToBeClose(updated?.detailsVector1024, detailsVector);
    });

    it('updates context vectors', async () => {
      const contextId = idGenerator('memory');
      await serverDB.insert(userMemoriesContexts).values({
        description: 'desc',
        id: contextId,
        title: 'title',
        userId,
      });

      const descriptionVector = generateRandomEmbedding();
      await userMemoryModel.updateContextVectors(contextId, { descriptionVector });
      const updated = await serverDB.query.userMemoriesContexts.findFirst({
        where: eq(userMemoriesContexts.id, contextId),
      });

      expectVectorToBeClose(updated?.descriptionVector, descriptionVector);
    });

    it('updates preference vector values including null assignments', async () => {
      const preferenceId = idGenerator('memory');
      await serverDB.insert(userMemoriesPreferences).values({
        conclusionDirectives: 'directive',
        conclusionDirectivesVector: generateRandomEmbedding(),
        id: preferenceId,
        userId,
      });

      await userMemoryModel.updatePreferenceVectors(preferenceId, {
        conclusionDirectivesVector: null,
      });

      const updated = await serverDB.query.userMemoriesPreferences.findFirst({
        where: eq(userMemoriesPreferences.id, preferenceId),
      });

      expect(updated?.conclusionDirectivesVector).toBeNull();
    });

    it('updates identity vectors', async () => {
      const identityId = idGenerator('memory');
      await serverDB.insert(userMemoriesIdentities).values({
        description: 'identity',
        id: identityId,
        userId,
      });

      const descriptionVector = generateRandomEmbedding();

      await userMemoryModel.updateIdentityVectors(identityId, {
        descriptionVector,
      });

      const updated = await serverDB.query.userMemoriesIdentities.findFirst({
        where: eq(userMemoriesIdentities.id, identityId),
      });

      expectVectorToBeClose(updated?.descriptionVector, descriptionVector);
    });

    it('updates experience vectors without touching unspecified fields', async () => {
      const experienceId = idGenerator('memory');
      const originalSituationVector = generateRandomEmbedding();
      const originalKeyLearningVector = generateRandomEmbedding();
      const originalActionVector = generateRandomEmbedding();

      await serverDB.insert(userMemoriesExperiences).values({
        action: 'action',
        actionVector: originalActionVector,
        id: experienceId,
        keyLearning: 'key learning',
        keyLearningVector: originalKeyLearningVector,
        situation: 'situation',
        situationVector: originalSituationVector,
        userId,
      });

      const updatedActionVector = generateRandomEmbedding();

      await userMemoryModel.updateExperienceVectors(experienceId, {
        actionVector: updatedActionVector,
      });

      const updated = await serverDB.query.userMemoriesExperiences.findFirst({
        where: eq(userMemoriesExperiences.id, experienceId),
      });

      expectVectorToBeClose(updated?.actionVector, updatedActionVector);
      expectVectorToBeClose(updated?.situationVector, originalSituationVector);
      expectVectorToBeClose(updated?.keyLearningVector, originalKeyLearningVector);
    });
  });

  describe('identity entry operations', () => {
    it('adds a new identity entry with base memory', async () => {
      const summaryVector = generateRandomEmbedding();
      const descriptionVector = generateRandomEmbedding();

      const { identityId, userMemoryId } = await userMemoryModel.addIdentityEntry({
        base: {
          memoryCategory: 'profile',
          memoryLayer: 'identity',
          memoryType: 'personal-profile',
          metadata: { meta: 'value' },
          summary: 'Initial summary',
          summaryVector1024: summaryVector,
          title: 'Identity Summary',
        },
        identity: {
          description: 'A detailed description of the user identity',
          descriptionVector,
          episodicDate: new Date('2024-01-01T00:00:00.000Z'),
          metadata: { extracted: ['friend'] },
          relationship: 'friend',
          role: 'software engineer',
          tags: ['tag-a'],
          type: 'personal',
        },
      });

      const baseMemory = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, userMemoryId),
      });
      const identityMemory = await serverDB.query.userMemoriesIdentities.findFirst({
        where: eq(userMemoriesIdentities.id, identityId),
      });

      expect(baseMemory?.summary).toBe('Initial summary');
      expectVectorToBeClose(baseMemory?.summaryVector1024, summaryVector);
      expect(baseMemory?.memoryLayer).toBe('identity');
      expect(baseMemory?.metadata).toEqual({ meta: 'value' });

      expect(identityMemory?.description).toBe('A detailed description of the user identity');
      expectVectorToBeClose(identityMemory?.descriptionVector, descriptionVector);
      expect(identityMemory?.relationship).toBe('friend');
      expect(identityMemory?.role).toBe('software engineer');
      expect(identityMemory?.type).toBe('personal');
      expect(identityMemory?.userMemoryId).toBe(userMemoryId);
    });

    it('updates identity entry fields with merge strategy', async () => {
      const { identityId, userMemoryId } = await userMemoryModel.addIdentityEntry({
        base: {
          memoryCategory: 'profile',
          summary: 'Original summary',
          title: 'Original title',
        },
        identity: {
          description: 'Original identity description',
          relationship: 'friend',
          role: 'developer',
          type: 'personal',
        },
      });

      const updated = await userMemoryModel.updateIdentityEntry({
        identityId,
        mergeStrategy: MergeStrategyEnum.Merge,
        base: {
          summary: 'Updated summary',
        },
        identity: {
          description: 'Updated identity description',
          relationship: 'mentor',
        },
      });

      expect(updated).toBe(true);

      const baseMemory = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, userMemoryId),
      });
      const identityMemory = await serverDB.query.userMemoriesIdentities.findFirst({
        where: eq(userMemoriesIdentities.id, identityId),
      });

      expect(baseMemory?.summary).toBe('Updated summary');
      expect(baseMemory?.title).toBe('Original title');
      expect(identityMemory?.description).toBe('Updated identity description');
      expect(identityMemory?.relationship).toBe('mentor');
      expect(identityMemory?.role).toBe('developer');
    });

    it('replaces identity entry fields and clears unspecified values when mergeStrategy is replace', async () => {
      const { identityId } = await userMemoryModel.addIdentityEntry({
        base: {
          summary: 'Summary to replace',
          title: 'Title to replace',
        },
        identity: {
          description: 'Description to replace',
          relationship: 'mentor',
          role: 'manager',
          type: 'professional',
        },
      });

      const replaced = await userMemoryModel.updateIdentityEntry({
        identityId,
        mergeStrategy: MergeStrategyEnum.Replace,
        identity: {
          description: 'Fresh description',
          type: 'personal',
        },
      });

      expect(replaced).toBe(true);

      const identityMemory = await serverDB.query.userMemoriesIdentities.findFirst({
        where: eq(userMemoriesIdentities.id, identityId),
      });

      expect(identityMemory?.description).toBe('Fresh description');
      expect(identityMemory?.type).toBe('personal');
      expect(identityMemory?.relationship).toBeNull();
      expect(identityMemory?.role).toBeNull();
    });

    it('removes identity entry and associated base memory', async () => {
      const { identityId, userMemoryId } = await userMemoryModel.addIdentityEntry({
        base: {
          summary: 'Summary to delete',
        },
        identity: {
          description: 'Identity to delete',
        },
      });

      const removed = await userMemoryModel.removeIdentityEntry(identityId);

      const baseMemory = await serverDB.query.userMemories.findFirst({
        where: eq(userMemories.id, userMemoryId),
      });
      const identityMemory = await serverDB.query.userMemoriesIdentities.findFirst({
        where: eq(userMemoriesIdentities.id, identityId),
      });

      expect(removed).toBe(true);
      expect(baseMemory).toBeUndefined();
      expect(identityMemory).toBeUndefined();
    });
  });

  describe('access metrics', () => {
    it('should update accessedAt for each layer table', async () => {
      const experienceParams = generateRandomCreateUserMemoryExperienceParams();
      const experienceMemory = await userMemoryModel.create(experienceParams);
      await serverDB.insert(userMemoriesExperiences).values({
        ...experienceParams.experience,
        userId,
        userMemoryId: experienceMemory.id,
      });

      const preferenceParams = generateRandomCreateUserMemoryPreferenceParams();
      const preferenceMemory = await userMemoryModel.create(preferenceParams);
      await serverDB.insert(userMemoriesPreferences).values({
        ...preferenceParams.preference,
        userId,
        userMemoryId: preferenceMemory.id,
      });

      const contextParams = generateRandomCreateUserMemoryContextParams();
      await serverDB.insert(userMemoriesContexts).values({
        ...contextParams.context,
        userId,
        userMemoryIds: [experienceMemory.id, preferenceMemory.id],
      });

      const beforeContexts = await serverDB.query.userMemoriesContexts.findMany({
        where: eq(userMemoriesContexts.userId, userId),
      });

      const beforeExperience = await serverDB.query.userMemoriesExperiences.findFirst({
        where: eq(userMemoriesExperiences.userMemoryId, experienceMemory.id),
      });
      const beforePreference = await serverDB.query.userMemoriesPreferences.findFirst({
        where: eq(userMemoriesPreferences.userMemoryId, preferenceMemory.id),
      });

      const beforeBaseMemories = await serverDB.query.userMemories.findMany({
        where: eq(userMemories.userId, userId),
      });

      await userMemoryModel.search({ limit: 10 });

      const afterExperience = await serverDB.query.userMemoriesExperiences.findFirst({
        where: eq(userMemoriesExperiences.userMemoryId, experienceMemory.id),
      });
      const afterPreference = await serverDB.query.userMemoriesPreferences.findFirst({
        where: eq(userMemoriesPreferences.userMemoryId, preferenceMemory.id),
      });
      const afterContexts = await serverDB.query.userMemoriesContexts.findMany({
        where: eq(userMemoriesContexts.userId, userId),
      });
      const afterBaseMemoryMap = new Map(
        (
          await serverDB.query.userMemories.findMany({
            where: eq(userMemories.userId, userId),
          })
        ).map((memory) => [memory.id, memory]),
      );

      expect(beforeExperience?.accessedAt?.getTime()).toBeDefined();
      expect(afterExperience?.accessedAt?.getTime()).toBeDefined();
      expect(afterExperience!.accessedAt.getTime()).toBeGreaterThanOrEqual(
        beforeExperience!.accessedAt.getTime(),
      );

      expect(beforePreference?.accessedAt?.getTime()).toBeDefined();
      expect(afterPreference?.accessedAt?.getTime()).toBeDefined();
      expect(afterPreference!.accessedAt.getTime()).toBeGreaterThanOrEqual(
        beforePreference!.accessedAt.getTime(),
      );

      beforeContexts.forEach((beforeContext) => {
        const afterContext = afterContexts.find((ctx) => ctx.id === beforeContext.id);
        expect(afterContext).toBeDefined();
        expect(afterContext!.accessedAt.getTime()).toBeGreaterThanOrEqual(
          beforeContext.accessedAt.getTime(),
        );
      });

      const updatedIds = new Set([experienceMemory.id, preferenceMemory.id]);

      for (const before of beforeBaseMemories) {
        const after = afterBaseMemoryMap.get(before.id);
        expect(after).toBeDefined();
        if (updatedIds.has(before.id)) {
          expect(after!.accessedCount).toBeDefined();
          expect(after!.accessedCount).toBe((before.accessedCount ?? 0) + 1);
          expect(after!.accessedAt.getTime()).toBeGreaterThanOrEqual(before.accessedAt.getTime());
          expect(after!.lastAccessedAt.getTime()).toBeGreaterThanOrEqual(
            before.lastAccessedAt.getTime(),
          );
        } else {
          expect(after!.accessedCount).toBe(before.accessedCount);
        }
      }
    });
  });
});
