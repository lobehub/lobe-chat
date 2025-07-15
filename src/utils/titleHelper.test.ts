import { describe, expect, it } from 'vitest';

import { findNextAvailableTitle } from './titleHelper';

describe('findNextAvailableTitle', () => {
  const defaultSymbol = 'copy';

  it('should return the base title if it is not in the set', () => {
    const titleSet = new Set<string>(['Another Title', 'Yet Another Title']);
    const baseTitle = 'Test Title';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(baseTitle);
  });

  it('should return the base title if the set is empty', () => {
    const titleSet = new Set<string>();
    const baseTitle = 'Test Title';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(baseTitle);
  });

  it('should append default duplicate symbol if base title exists', () => {
    const titleSet = new Set<string>(['Test Title']);
    const baseTitle = 'Test Title';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`Test Title ${defaultSymbol}`);
  });

  it('should append custom duplicate symbol if base title exists', () => {
    const titleSet = new Set<string>(['Test Title']);
    const baseTitle = 'Test Title';
    const customSymbol = 'dup';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, customSymbol);
    expect(nextTitle).toBe(`Test Title ${customSymbol}`);
  });

  it('should append "symbol 1" if "base title" and "base title symbol" exist', () => {
    const titleSet = new Set<string>(['Test Title', `Test Title ${defaultSymbol}`]);
    const baseTitle = 'Test Title';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`Test Title ${defaultSymbol} 1`);
  });

  it('should increment number if "base title symbol N" exists', () => {
    const titleSet = new Set<string>([
      'Test Title',
      `Test Title ${defaultSymbol}`,
      `Test Title ${defaultSymbol} 1`,
    ]);
    const baseTitle = 'Test Title';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`Test Title ${defaultSymbol} 2`);
  });

  it('should find the next available number in a sequence', () => {
    const titleSet = new Set<string>([
      'Test Title',
      `Test Title ${defaultSymbol}`,
      `Test Title ${defaultSymbol} 1`,
      `Test Title ${defaultSymbol} 3`, // Gap here
    ]);
    const baseTitle = 'Test Title';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`Test Title ${defaultSymbol} 2`);
  });

  it('should handle base title that already ends with the duplicate symbol', () => {
    const titleSet = new Set<string>([`Test Title ${defaultSymbol}`]);
    const baseTitle = `Test Title ${defaultSymbol}`;
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`Test Title ${defaultSymbol} 1`);
  });

  it('should handle base title that already ends with "symbol N"', () => {
    const titleSet = new Set<string>([`Test Title ${defaultSymbol} 1`]);
    const baseTitle = `Test Title ${defaultSymbol} 1`;
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`Test Title ${defaultSymbol} 2`);
  });

  it('should correctly strip existing "symbol N" from baseTitle to find next available', () => {
    const titleSet = new Set<string>([
      'My Session',
      `My Session ${defaultSymbol}`,
      `My Session ${defaultSymbol} 1`,
      `My Session ${defaultSymbol} 2`,
    ]);
    const baseTitle = `My Session ${defaultSymbol} 1`; // Start with an existing numbered title
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`My Session ${defaultSymbol} 3`);
  });

  it('should correctly strip existing "symbol" (no number) from baseTitle to find next available', () => {
    const titleSet = new Set<string>([
      'My Session',
      `My Session ${defaultSymbol}`,
    ]);
    const baseTitle = `My Session ${defaultSymbol}`;
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`My Session ${defaultSymbol} 1`);
  });

  it('should handle complex cases with gaps and existing numbered titles', () => {
    const titleSet = new Set<string>([
      'Project Alpha',
      `Project Alpha ${defaultSymbol}`,
      `Project Alpha ${defaultSymbol} 2`, // Gap at 1
      `Project Alpha ${defaultSymbol} 3`,
    ]);
    const baseTitle = 'Project Alpha';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`Project Alpha ${defaultSymbol} 1`);

    const baseTitle2 = `Project Alpha ${defaultSymbol} 2`;
    const nextTitle2 = findNextAvailableTitle(baseTitle2, titleSet, defaultSymbol);
    expect(nextTitle2).toBe(`Project Alpha ${defaultSymbol} 4`);
  });

  it('should handle symbols that might be part of the base name if not careful with regex', () => {
    const titleSet = new Set<string>(['Basecopy', `Basecopy ${defaultSymbol}`]);
    // Base title itself contains 'copy'
    const baseTitle = 'Basecopy';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`Basecopy ${defaultSymbol} 1`);

    const titleSet2 = new Set<string>(['Base copy Base', `Base copy Base ${defaultSymbol}`]);
    const baseTitle2 = 'Base copy Base';
    const nextTitle2 = findNextAvailableTitle(baseTitle2, titleSet2, defaultSymbol);
    expect(nextTitle2).toBe(`Base copy Base ${defaultSymbol} 1`);
  });

  it('should work with a base title that is just the symbol', () => {
    const titleSet = new Set<string>([defaultSymbol, `${defaultSymbol} ${defaultSymbol}`]);
    const baseTitle = defaultSymbol;
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, defaultSymbol);
    expect(nextTitle).toBe(`${defaultSymbol} ${defaultSymbol} 1`);
  });

  it('should append number directly if duplicateSymbol is empty', () => {
    const titleSet = new Set<string>(['Test Title']);
    const baseTitle = 'Test Title';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, '');
    expect(nextTitle).toBe('Test Title 1');
  });

  it('should increment number if duplicateSymbol is empty and numbered titles exist', () => {
    const titleSet = new Set<string>(['Test Title', 'Test Title 1', 'Test Title 2']);
    const baseTitle = 'Test Title';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, '');
    expect(nextTitle).toBe('Test Title 3');
  });

  it('should handle baseTitle that already ends with a number when duplicateSymbol is empty', () => {
    const titleSet = new Set<string>(['Test Title 1']);
    const baseTitle = 'Test Title 1';
    const nextTitle = findNextAvailableTitle(baseTitle, titleSet, '');
    expect(nextTitle).toBe('Test Title 2');
  });
});
