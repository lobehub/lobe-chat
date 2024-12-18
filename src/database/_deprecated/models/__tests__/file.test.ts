import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BrowserDB } from '../../core/db';
import { DB_File } from '../../schemas/files';
import { FileModel } from '../file';

// Assuming LocalDB is already mocked or using an in-memory database
// and LocalFileSchema has been imported correctly.

describe('_FileModel', () => {
  let fileData: DB_File;

  beforeEach(() => {
    // Set up file data with the correct structure according to LocalFileSchema
    fileData = {
      data: new ArrayBuffer(10),
      fileType: 'image/png',
      name: 'test.png',
      saveMode: 'local',
      size: 10,
      // url is optional, only needed if saveMode is 'url'
    };
  });

  afterEach(async () => {
    // Clean up the database after each test
    const db = new BrowserDB();
    await db.files.clear();
    db.close();
  });

  it('should create a file record', async () => {
    // First, create a file to test the create method
    const fileData: DB_File = {
      data: new ArrayBuffer(10),
      fileType: 'image/png',
      name: 'test.png',
      saveMode: 'local',
      size: 10,
    };

    const result = await FileModel.create(fileData);

    expect(result).toHaveProperty('id');
    expect(result.id).toMatch(/^file-/);

    // Verify that the file has been added to the database
    const fileInDb = await FileModel.findById(result.id);

    expect(fileInDb).toEqual(expect.objectContaining(fileData));
  });

  it('should find a file by id', async () => {
    // First, create a file to test the findById method
    const createdFile = await FileModel.create(fileData);
    const foundFile = await FileModel.findById(createdFile.id);

    expect(foundFile).toEqual(expect.objectContaining(fileData));
  });

  it('should delete a file by id', async () => {
    // First, create a file to test the delete method
    const createdFile = await FileModel.create(fileData);
    await FileModel.delete(createdFile.id);

    // Verify that the file has been removed from the database
    const fileInDb = await FileModel.findById(createdFile.id);
    expect(fileInDb).toBeUndefined();
  });

  it('should clear all files', async () => {
    // First, create a file to test the delete method
    const createdFile = await FileModel.create(fileData);
    const createdFile2 = await FileModel.create(fileData);
    await FileModel.clear();

    // Verify that the file has been removed from the database
    const fileInDb = await FileModel.findById(createdFile.id);
    expect(fileInDb).toBeUndefined();
    const fileInDb2 = await FileModel.findById(createdFile2.id);
    expect(fileInDb2).toBeUndefined();
  });
});
