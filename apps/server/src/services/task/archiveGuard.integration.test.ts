// @vitest-environment node
import { type LobeChatDatabase } from '@lobechat/database';
import { getTestDB } from '@lobechat/database/test-utils';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TaskModel } from '@/database/models/task';
import { TaskArchiveModel } from '@/database/models/taskArchive';
import { tasks, users } from '@/database/schemas';

import { writeKeepingArchivedIdle } from './archiveGuard';

const userId = 'archive-guard-integration-user';

describe('writeKeepingArchivedIdle (real PostgreSQL)', () => {
  let db: LobeChatDatabase;

  beforeEach(async () => {
    db = await getTestDB();
    await db.delete(users).where(eq(users.id, userId));
    await db.insert(users).values({ id: userId });
  });

  afterEach(async () => {
    await db.delete(users).where(eq(users.id, userId));
  });

  it('rolls back a write that would make an already archived task live', async () => {
    const model = new TaskModel(db, userId);
    const task = await model.create({ instruction: 'Idle task' });
    // The archive commits first, as it would in a concurrent request.
    await new TaskArchiveModel(db, userId).archive(task.id);

    await expect(
      writeKeepingArchivedIdle(db, (tx) =>
        new TaskModel(tx, userId).update(task.id, {
          automationMode: 'heartbeat',
          heartbeatInterval: 600,
        }),
      ),
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });

    const stored = await model.findById(task.id);
    expect(stored?.archivedAt).toBeInstanceOf(Date);
    expect(stored?.automationMode).toBeNull();
    expect(stored?.heartbeatInterval).toBeNull();
  });

  it('rolls back every statement of the transaction', async () => {
    const model = new TaskModel(db, userId);
    const task = await model.create({ instruction: 'Idle task' });

    await expect(
      writeKeepingArchivedIdle(db, async (tx) => {
        const [row] = await tx
          .update(tasks)
          .set({ archivedAt: new Date(), status: 'running' })
          .where(eq(tasks.id, task.id))
          .returning();
        return row;
      }),
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });

    const stored = await model.findById(task.id);
    expect(stored?.archivedAt).toBeNull();
    expect(stored?.status).toBe('backlog');
  });

  it('lets an idle write through', async () => {
    const model = new TaskModel(db, userId);
    const task = await model.create({ instruction: 'Idle task' });
    await new TaskArchiveModel(db, userId).archive(task.id);

    const renamed = await writeKeepingArchivedIdle(db, (tx) =>
      new TaskModel(tx, userId).update(task.id, { name: 'Renamed' }),
    );
    expect(renamed?.name).toBe('Renamed');
  });
});
