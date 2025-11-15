// @vitest-environment node
import { FilesTabs } from '@lobechat/types';
import { beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../models/__tests__/_util';
import { NewDocument, documents } from '../../schemas/file';
import { NewFile, files } from '../../schemas/file';
import { users } from '../../schemas/user';
import { LobeChatDatabase } from '../../type';
import { KnowledgeRepo } from './index';

const userId = 'knowledge-test-user';
const otherUserId = 'other-knowledge-user';

let knowledgeRepo: KnowledgeRepo;

const serverDB: LobeChatDatabase = await getTestDB();

beforeEach(async () => {
  // Clean up
  await serverDB.delete(users);

  // Create test users
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);

  // Initialize repo
  knowledgeRepo = new KnowledgeRepo(serverDB, userId);
});

describe('KnowledgeRepo', () => {
  describe('query - Documents category filtering', () => {
    beforeEach(async () => {
      // Create test files
      const testFiles: NewFile[] = [
        {
          fileType: 'application/pdf',
          name: 'regular-pdf-file.pdf',
          size: 1024,
          url: 'file-pdf-url',
          userId,
        },
        {
          fileType: 'custom/other',
          name: 'custom-file.txt',
          size: 512,
          url: 'custom-file-url',
          userId,
        },
      ];

      await serverDB.insert(files).values(testFiles);

      // Create test documents
      const testDocuments: NewDocument[] = [
        // This should be EXCLUDED (sourceType='file')
        {
          content: 'PDF from file upload',
          fileType: 'application/pdf',
          filename: 'uploaded-pdf.pdf',
          source: 'upload-source',
          sourceType: 'file',
          totalCharCount: 100,
          totalLineCount: 10,
          userId,
        },
        // This should be EXCLUDED (fileType='custom/document')
        {
          content: 'Editor document',
          fileType: 'custom/document',
          filename: 'editor-doc.md',
          source: 'editor-source',
          sourceType: 'file',
          totalCharCount: 200,
          totalLineCount: 20,
          userId,
        },
        // This should be INCLUDED (application/pdf with sourceType='api')
        {
          content: 'PDF from API',
          fileType: 'application/pdf',
          filename: 'api-pdf.pdf',
          source: 'api-source',
          sourceType: 'api',
          totalCharCount: 300,
          totalLineCount: 30,
          userId,
        },
        // This should be INCLUDED (custom/other with sourceType='web')
        {
          content: 'Custom web document',
          fileType: 'custom/other',
          filename: 'web-doc.txt',
          source: 'web-source',
          sourceType: 'web',
          totalCharCount: 400,
          totalLineCount: 40,
          userId,
        },
      ];

      await serverDB.insert(documents).values(testDocuments);
    });

    it('should exclude documents with fileType="custom/document" from Documents category', async () => {
      const results = await knowledgeRepo.query({ category: FilesTabs.Documents });

      // Should not include editor document (custom/document)
      const editorDoc = results.find((item) => item.name === 'editor-doc.md');
      expect(editorDoc).toBeUndefined();
    });

    it('should exclude documents with sourceType="file" from Documents category', async () => {
      const results = await knowledgeRepo.query({ category: FilesTabs.Documents });

      // Should not include uploaded PDF document (sourceType='file')
      const uploadedPdf = results.find((item) => item.name === 'uploaded-pdf.pdf');
      expect(uploadedPdf).toBeUndefined();
    });

    it('should include documents with sourceType="api" in Documents category', async () => {
      const results = await knowledgeRepo.query({ category: FilesTabs.Documents });

      // Should include API PDF (application/pdf with sourceType='api')
      const apiPdf = results.find((item) => item.name === 'api-pdf.pdf');
      expect(apiPdf).toBeDefined();
      expect(apiPdf?.sourceType).toBe('document');
      expect(apiPdf?.fileType).toBe('application/pdf');
    });

    it('should include documents with sourceType="web" in Documents category', async () => {
      const results = await knowledgeRepo.query({ category: FilesTabs.Documents });

      // Should include web document (custom/other with sourceType='web')
      const webDoc = results.find((item) => item.name === 'web-doc.txt');
      expect(webDoc).toBeDefined();
      expect(webDoc?.sourceType).toBe('document');
      expect(webDoc?.fileType).toBe('custom/other');
    });

    it('should include files from files table in Documents category', async () => {
      const results = await knowledgeRepo.query({ category: FilesTabs.Documents });

      // Should include regular files
      const regularFile = results.find((item) => item.name === 'regular-pdf-file.pdf');
      expect(regularFile).toBeDefined();
      expect(regularFile?.sourceType).toBe('file');
    });

    it('should show all documents in All category (no filtering)', async () => {
      const results = await knowledgeRepo.query({ category: FilesTabs.All });

      // All category should include everything
      expect(results.length).toBeGreaterThanOrEqual(6); // 2 files + 4 documents

      const editorDoc = results.find((item) => item.name === 'editor-doc.md');
      const uploadedPdf = results.find((item) => item.name === 'uploaded-pdf.pdf');

      expect(editorDoc).toBeDefined();
      expect(uploadedPdf).toBeDefined();
    });

    it('should apply both filters together in Documents category', async () => {
      const results = await knowledgeRepo.query({ category: FilesTabs.Documents });

      // Count documents with sourceType='document'
      const documentTypeItems = results.filter((item) => item.sourceType === 'document');

      // Should have exactly 2 documents (api-pdf and web-doc)
      // Excluded: uploaded-pdf (sourceType='file') and editor-doc (fileType='custom/document')
      expect(documentTypeItems).toHaveLength(2);

      const names = documentTypeItems.map((item) => item.name).sort();
      expect(names).toEqual(['api-pdf.pdf', 'web-doc.txt']);
    });
  });

  describe('query - user isolation', () => {
    beforeEach(async () => {
      // Create files for current user
      await serverDB.insert(files).values({
        fileType: 'application/pdf',
        name: 'user-file.pdf',
        size: 1024,
        url: 'user-file-url',
        userId,
      });

      // Create files for other user
      await serverDB.insert(files).values({
        fileType: 'application/pdf',
        name: 'other-user-file.pdf',
        size: 1024,
        url: 'other-file-url',
        userId: otherUserId,
      });

      // Create documents for current user
      await serverDB.insert(documents).values({
        content: 'User document',
        fileType: 'application/pdf',
        filename: 'user-doc.pdf',
        source: 'user-source',
        sourceType: 'api',
        totalCharCount: 100,
        totalLineCount: 10,
        userId,
      });

      // Create documents for other user
      await serverDB.insert(documents).values({
        content: 'Other user document',
        fileType: 'application/pdf',
        filename: 'other-doc.pdf',
        source: 'other-source',
        sourceType: 'api',
        totalCharCount: 100,
        totalLineCount: 10,
        userId: otherUserId,
      });
    });

    it('should only return current user items', async () => {
      const results = await knowledgeRepo.query({ category: FilesTabs.All });

      // Should only have items from current user
      expect(results).toHaveLength(2);

      const names = results.map((item) => item.name).sort();
      expect(names).toEqual(['user-doc.pdf', 'user-file.pdf']);

      // Should not include other user's items
      const otherUserFile = results.find((item) => item.name === 'other-user-file.pdf');
      const otherUserDoc = results.find((item) => item.name === 'other-doc.pdf');

      expect(otherUserFile).toBeUndefined();
      expect(otherUserDoc).toBeUndefined();
    });
  });

  describe('query - search filtering', () => {
    beforeEach(async () => {
      await serverDB.insert(files).values([
        {
          fileType: 'application/pdf',
          name: 'report-2024.pdf',
          size: 1024,
          url: 'report-url',
          userId,
        },
        {
          fileType: 'application/pdf',
          name: 'invoice.pdf',
          size: 512,
          url: 'invoice-url',
          userId,
        },
      ]);

      await serverDB.insert(documents).values([
        {
          content: 'Annual report content',
          fileType: 'application/pdf',
          filename: 'annual-report.pdf',
          source: 'api-source',
          sourceType: 'api',
          title: 'Annual Report',
          totalCharCount: 1000,
          totalLineCount: 100,
          userId,
        },
        {
          content: 'Meeting notes',
          fileType: 'custom/other',
          filename: 'notes.txt',
          source: 'web-source',
          sourceType: 'web',
          title: 'Meeting Notes',
          totalCharCount: 500,
          totalLineCount: 50,
          userId,
        },
      ]);
    });

    it('should filter by search query in file names', async () => {
      const results = await knowledgeRepo.query({ category: FilesTabs.All, q: 'report' });

      expect(results).toHaveLength(2);
      const names = results.map((item) => item.name).sort();
      expect(names).toEqual(['Annual Report', 'report-2024.pdf']);
    });

    it('should filter by search query in document titles', async () => {
      const results = await knowledgeRepo.query({ category: FilesTabs.All, q: 'meeting' });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Meeting Notes');
    });
  });
});
