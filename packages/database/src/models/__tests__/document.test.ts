// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { documents, files, users } from '../../schemas';
import { LobeChatDatabase } from '../../type';
import { DocumentModel } from '../document';
import { FileModel } from '../file';
import { getTestDB } from './_util';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'document-model-test-user-id';
const userId2 = 'document-model-test-user-id-2';
const documentModel = new DocumentModel(serverDB, userId);
const documentModel2 = new DocumentModel(serverDB, userId2);
const fileModel = new FileModel(serverDB, userId);
const fileModel2 = new FileModel(serverDB, userId2);

beforeEach(async () => {
  await serverDB.delete(users);
  await serverDB.insert(users).values([{ id: userId }, { id: userId2 }]);
});

afterEach(async () => {
  await serverDB.delete(users);
  await serverDB.delete(files);
  await serverDB.delete(documents);
});

// Helper to create a minimal valid document
const createTestDocument = async (model: DocumentModel, fModel: FileModel, content: string) => {
  const { id: fileId } = await fModel.create({
    fileType: 'text/plain',
    name: 'test.txt',
    size: 100,
    url: 'https://example.com/test.txt',
  });

  // Fetch the file to get complete data
  const file = await fModel.findById(fileId);
  if (!file) throw new Error('File not found after creation');

  const { id } = await model.create({
    content,
    fileId: file.id,
    fileType: 'text/plain',
    source: file.url,
    sourceType: 'file',
    totalCharCount: content.length,
    totalLineCount: content.split('\n').length,
  });

  return { documentId: id, file };
};

describe('DocumentModel', () => {
  describe('findByFileId', () => {
    it('should find document by fileId', async () => {
      const { documentId, file } = await createTestDocument(
        documentModel,
        fileModel,
        'Test content for file',
      );

      const found = await documentModel.findByFileId(file.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(documentId);
      expect(found?.fileId).toBe(file.id);
      expect(found?.content).toBe('Test content for file');
    });

    it('should not find document from another user', async () => {
      const { file } = await createTestDocument(documentModel, fileModel, 'Test content');

      // Try to find with another user's model
      const found = await documentModel2.findByFileId(file.id);
      expect(found).toBeUndefined();
    });

    it('should return undefined for non-existent fileId', async () => {
      const found = await documentModel.findByFileId('non-existent-file-id');
      expect(found).toBeUndefined();
    });

    it('should return the first document when multiple documents exist for same file', async () => {
      const { id: fileId } = await fileModel.create({
        fileType: 'text/plain',
        name: 'test.txt',
        size: 100,
        url: 'https://example.com/test.txt',
      });

      const file = await fileModel.findById(fileId);
      if (!file) throw new Error('File not found after creation');

      const { id: firstId } = await documentModel.create({
        content: 'First document',
        fileId: file.id,
        fileType: 'text/plain',
        source: file.url,
        sourceType: 'file',
        totalCharCount: 14,
        totalLineCount: 1,
      });

      await documentModel.create({
        content: 'Second document',
        fileId: file.id,
        fileType: 'text/plain',
        source: file.url,
        sourceType: 'file',
        totalCharCount: 15,
        totalLineCount: 1,
      });

      const found = await documentModel.findByFileId(file.id);
      expect(found).toBeDefined();
      // Should return the first created document
      expect(found?.id).toBe(firstId);
    });

    it('should handle different file types', async () => {
      const { id: pdfFileId } = await fileModel.create({
        fileType: 'application/pdf',
        name: 'document.pdf',
        size: 5000,
        url: 'https://example.com/document.pdf',
      });

      const pdfFile = await fileModel.findById(pdfFileId);
      if (!pdfFile) throw new Error('File not found after creation');

      await documentModel.create({
        content: 'PDF content',
        fileId: pdfFile.id,
        fileType: 'application/pdf',
        source: pdfFile.url,
        sourceType: 'file',
        totalCharCount: 11,
        totalLineCount: 1,
      });

      const found = await documentModel.findByFileId(pdfFile.id);
      expect(found).toBeDefined();
      expect(found?.fileType).toBe('application/pdf');
      expect(found?.content).toBe('PDF content');
    });
  });
});
