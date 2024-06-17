// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTestDBInstance } from '@/database/server/core/dbForTest';

import { files, users } from '../../schemas/lobechat';
import { FileModel } from '../file';

let serverDB = await getTestDBInstance();

vi.mock('@/database/server/core/db', async () => ({
  get serverDB() {
    return serverDB;
  },
}));

const userId = 'file-model-test-user-id';
const fileModel = new FileModel(userId);

beforeEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
  await serverDB.insert(users).values({ id: userId });
});

afterEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
  await serverDB.delete(files).where(eq(files.userId, userId));
});

describe('FileModel', () => {
  it('should create a new file', async () => {
    const params = {
      name: 'test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 100,
      fileType: 'text/plain',
    };

    const { id } = await fileModel.create(params);
    expect(id).toBeDefined();

    const file = await serverDB.query.files.findFirst({ where: eq(files.id, id) });
    expect(file).toMatchObject({ ...params, userId });
  });

  it('should delete a file by id', async () => {
    const { id } = await fileModel.create({
      name: 'test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 100,
      fileType: 'text/plain',
    });

    await fileModel.delete(id);

    const file = await serverDB.query.files.findFirst({ where: eq(files.id, id) });
    expect(file).toBeUndefined();
  });

  it('should clear all files for the user', async () => {
    await fileModel.create({
      name: 'test-file-1.txt',
      url: 'https://example.com/test-file-1.txt',
      size: 100,
      fileType: 'text/plain',
    });
    await fileModel.create({
      name: 'test-file-2.txt',
      url: 'https://example.com/test-file-2.txt',
      size: 200,
      fileType: 'text/plain',
    });

    await fileModel.clear();

    const userFiles = await serverDB.query.files.findMany({ where: eq(files.userId, userId) });
    expect(userFiles).toHaveLength(0);
  });

  it('should query files for the user', async () => {
    await fileModel.create({
      name: 'test-file-1.txt',
      url: 'https://example.com/test-file-1.txt',
      size: 100,
      fileType: 'text/plain',
    });
    await fileModel.create({
      name: 'test-file-2.txt',
      url: 'https://example.com/test-file-2.txt',
      size: 200,
      fileType: 'text/plain',
    });

    const userFiles = await fileModel.query();
    expect(userFiles).toHaveLength(2);
    expect(userFiles[0].name).toBe('test-file-2.txt');
    expect(userFiles[1].name).toBe('test-file-1.txt');
  });

  it('should find a file by id', async () => {
    const { id } = await fileModel.create({
      name: 'test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 100,
      fileType: 'text/plain',
    });

    const file = await fileModel.findById(id);
    expect(file).toMatchObject({
      id,
      name: 'test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 100,
      fileType: 'text/plain',
      userId,
    });
  });

  it('should update a file', async () => {
    const { id } = await fileModel.create({
      name: 'test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 100,
      fileType: 'text/plain',
    });

    await fileModel.update(id, { name: 'updated-test-file.txt', size: 200 });

    const updatedFile = await serverDB.query.files.findFirst({ where: eq(files.id, id) });
    expect(updatedFile).toMatchObject({
      id,
      name: 'updated-test-file.txt',
      url: 'https://example.com/test-file.txt',
      size: 200,
      fileType: 'text/plain',
      userId,
    });
  });
});
