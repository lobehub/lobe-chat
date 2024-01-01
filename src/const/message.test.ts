import { describe, expect, it } from 'vitest';

import { testFunctionMessageAtEnd } from './message';

describe('testFunctionMessageAtEnd', () => {
  it('should extract tool_calls JSON when present', () => {
    const content = 'Some content before {"tool_calls": [{"tool": "example", "args": ["arg1"]}]}';
    const result = testFunctionMessageAtEnd(content);
    expect(result).toEqual({
      content: '{"tool_calls": [{"tool": "example", "args": ["arg1"]}]}',
      valid: true,
    });
  });

  it('should extract tool_calls JSON when there are space at end', () => {
    const content =
      'Some content before {"tool_calls": [{"tool": "example", "args": ["arg1"]}]}     ';
    const result = testFunctionMessageAtEnd(content);
    expect(result).toEqual({
      content: '{"tool_calls": [{"tool": "example", "args": ["arg1"]}]}',
      valid: true,
    });
  });

  it('should not extract tool_calls JSON when in middle', () => {
    const content =
      'Some content before {"tool_calls": [{"tool": "example", "args": ["arg1"]}]}, here are some end content';
    const result = testFunctionMessageAtEnd(content);
    expect(result).toEqual({ content: '', valid: false });
  });

  it('should return an empty string and valid false when JSON is not present', () => {
    const content = 'Some content without the JSON structure';
    const result = testFunctionMessageAtEnd(content);
    expect(result).toEqual({ content: '', valid: false });
  });

  it('should return an empty string and valid false when content is empty', () => {
    const content = '';
    const result = testFunctionMessageAtEnd(content);

    expect(result).toEqual({ content: '', valid: false });
  });

  it('should handle null or undefined content gracefully', () => {
    const nullContent = null;
    const undefinedContent = undefined;

    const resultWithNull = testFunctionMessageAtEnd(nullContent as any);
    const resultWithUndefined = testFunctionMessageAtEnd(undefinedContent as any);

    expect(resultWithNull).toEqual({ content: '', valid: false });
    expect(resultWithUndefined).toEqual({ content: '', valid: false });
  });
});
