import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DBModel } from '@/database/core/types/db';
import { DB_File } from '@/database/schemas/files';

import { LocalDB } from '../db';

describe('LocalDB', () => {
  let db: LocalDB;

  beforeEach(() => {
    db = new LocalDB();
  });

  afterEach(async () => {
    await db.delete();
    db.close();
  });

  it('should be instantiated with the correct schema', () => {
    const filesTable = db.files;

    expect(filesTable).toBeDefined();
  });

  it('should allow adding a file', async () => {
    const file: DBModel<DB_File> = {
      id: 'file1',
      name: 'testfile.txt',
      data: new ArrayBuffer(3),
      saveMode: 'local',
      fileType: 'plain/text',
      size: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.files.add(file);

    expect(await db.files.get(file.id)).toEqual(file);
  });

  it('should allow updating a file', async () => {
    const file: DBModel<DB_File> = {
      id: 'file1',
      name: 'testfile.txt',
      data: new ArrayBuffer(3),
      saveMode: 'local',
      fileType: 'plain/text',
      size: 3,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.files.add(file);

    // Act
    await db.files.update(file.id, { name: 'update.txt' });

    // Assert
    expect(await db.files.get(file.id)).toHaveProperty('name', 'update.txt');
  });

  it('should allow deleting a file', async () => {
    const file: DBModel<DB_File> = {
      id: 'file1',
      name: 'testfile.txt',
      data: new ArrayBuffer(3),
      saveMode: 'local',
      fileType: 'plain/text',
      size: 3,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };
    await db.files.add(file);

    await db.files.delete(file.id);

    expect(await db.files.get(file.id)).toBeUndefined();
  });
});
