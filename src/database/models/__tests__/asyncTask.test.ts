// @vitest-environment node
import { eq } from 'drizzle-orm/expressions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeChatDatabase } from '@/database/type';
import { AsyncTaskStatus, AsyncTaskType } from '@/types/asyncTask';

import { asyncTasks, users } from '../../schemas';
import { ASYNC_TASK_TIMEOUT, AsyncTaskModel } from '../../server/models/asyncTask';
import { getTestDB } from './_util';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'async-task-model-test-user-id';
const asyncTaskModel = new AsyncTaskModel(serverDB, userId);

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }]);
});

afterEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
});

describe('AsyncTaskModel', () => {
  describe('create', () => {
    it('should create a new async task', async () => {
      const params = {
        type: AsyncTaskType.Chunking,
        status: AsyncTaskStatus.Processing,
      };

      const taskId = await asyncTaskModel.create(params);

      const task = await serverDB.query.asyncTasks.findFirst({
        where: eq(asyncTasks.id, taskId),
      });
      expect(task).toMatchObject({ ...params, userId });
    });
  });

  describe('delete', () => {
    it('should delete an async task by id', async () => {
      const { id } = await serverDB
        .insert(asyncTasks)
        .values({
          type: AsyncTaskType.Chunking,
          status: AsyncTaskStatus.Processing,
          userId,
        })
        .returning()
        .then((res) => res[0]);

      await asyncTaskModel.delete(id);

      const task = await serverDB.query.asyncTasks.findFirst({
        where: eq(asyncTasks.id, id),
      });
      expect(task).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find an async task by id', async () => {
      const { id } = await serverDB
        .insert(asyncTasks)
        .values({
          type: AsyncTaskType.Chunking,
          status: AsyncTaskStatus.Processing,
          userId,
        })
        .returning()
        .then((res) => res[0]);

      const task = await asyncTaskModel.findById(id);
      expect(task).toBeDefined();
      expect(task?.id).toBe(id);
    });
  });

  describe('update', () => {
    it('should update an async task', async () => {
      const { id } = await serverDB
        .insert(asyncTasks)
        .values({
          type: AsyncTaskType.Chunking,
          status: AsyncTaskStatus.Processing,
          userId,
        })
        .returning()
        .then((res) => res[0]);

      await asyncTaskModel.update(id, { status: AsyncTaskStatus.Success });

      const updatedTask = await serverDB.query.asyncTasks.findFirst({
        where: eq(asyncTasks.id, id),
      });
      expect(updatedTask?.status).toBe(AsyncTaskStatus.Success);
    });
  });

  describe('findByIds', () => {
    it('should find async tasks by ids and type', async () => {
      const tasks = await serverDB
        .insert(asyncTasks)
        .values([
          { type: AsyncTaskType.Chunking, status: AsyncTaskStatus.Processing, userId },
          { type: AsyncTaskType.Chunking, status: AsyncTaskStatus.Success, userId },
          { type: AsyncTaskType.Embedding, status: AsyncTaskStatus.Processing, userId },
        ])
        .returning();

      const chunkTasks = await asyncTaskModel.findByIds(
        tasks.map((t) => t.id),
        AsyncTaskType.Chunking,
      );

      expect(chunkTasks).toHaveLength(2);
      expect(chunkTasks.every((t) => t.type === AsyncTaskType.Chunking)).toBe(true);
    });
  });

  describe('checkTimeoutTasks', () => {
    it('should mark tasks as error if they timeout', async () => {
      vi.useFakeTimers();

      const { id } = await serverDB
        .insert(asyncTasks)
        .values({
          type: AsyncTaskType.Chunking,
          status: AsyncTaskStatus.Processing,
          userId,
          createdAt: new Date(Date.now() - ASYNC_TASK_TIMEOUT - 1000), // Make sure it's older than the timeout
        })
        .returning()
        .then((res) => res[0]);

      await asyncTaskModel.checkTimeoutTasks([id]);

      const updatedTask = await serverDB.query.asyncTasks.findFirst({
        where: eq(asyncTasks.id, id),
      });
      expect(updatedTask?.status).toBe(AsyncTaskStatus.Error);
      expect(updatedTask?.error).toBeDefined();

      vi.useRealTimers();
    });

    it('should not mark tasks as error if they are not timed out', async () => {
      const { id } = await serverDB
        .insert(asyncTasks)
        .values({
          type: AsyncTaskType.Chunking,
          status: AsyncTaskStatus.Processing,
          userId,
          createdAt: new Date(), // Current time, should not timeout
        })
        .returning()
        .then((res) => res[0]);

      await asyncTaskModel.checkTimeoutTasks([id]);

      const updatedTask = await serverDB.query.asyncTasks.findFirst({
        where: eq(asyncTasks.id, id),
      });
      expect(updatedTask?.status).toBe(AsyncTaskStatus.Processing);
      expect(updatedTask?.error).toBeNull();
    });
  });
});
