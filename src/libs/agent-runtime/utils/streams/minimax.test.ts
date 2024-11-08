import { describe, it, expect } from 'vitest';
import { processDoubleData } from './minimax'; // 假设文件名为 minimax.ts

describe('processDoubleData', () => {
  it('should remove the second "data: {"id": and everything after it when matchCount is 2', () => {
    const chunkValue = `data: {"id":"first"} some other text 
    
    data: {"id":"second"} more text`;
    const result = processDoubleData(chunkValue);
    expect(result).toBe('data: {"id":"first"} some other text');
  });

  it('should not modify chunkValue when matchCount is not 2', () => {
    const chunkValue = `data: {"id":"first"} some other text`;
    const result = processDoubleData(chunkValue);
    expect(result).toBe(chunkValue);
  });

  it('should not modify chunkValue when matchCount is more than 2', () => {
    const chunkValue = `data: {"id":"first"} some other text data: {"id":"second"} more text data: {"id":"third"} even more text`;
    const result = processDoubleData(chunkValue);
    expect(result).toBe(chunkValue);
  });
});
