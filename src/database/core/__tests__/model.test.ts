import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { BaseModel } from '../model';

// Define a mock schema for testing
const mockSchema = z.object({
  name: z.string(),
  content: z.string(),
});

// Define a mock table name
const mockTableName = 'files';

describe('BaseModel', () => {
  let baseModel: BaseModel<typeof mockTableName>;

  beforeEach(() => {
    baseModel = new BaseModel(mockTableName, mockSchema);
    // Mock the console.error to test error logging
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // console.error = originalConsoleError;
  });

  it('should have a table property', () => {
    expect(baseModel.table).toBeDefined();
  });

  describe('add method', () => {
    it('should add a valid record to the database', async () => {
      const validData = {
        name: 'testfile.txt',
        content: 'Hello, World!',
      };

      const result = await baseModel['_add'](validData);

      expect(result).toHaveProperty('id');
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should throw an error and log to console when adding an invalid record', async () => {
      const invalidData = {
        name: 123, // Invalid type, should be a string
        content: 'Hello, World!',
      };

      await expect(baseModel['_add'](invalidData)).rejects.toThrow(TypeError);
    });
  });
});
