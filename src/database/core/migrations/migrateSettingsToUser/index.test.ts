import { describe, expect } from 'vitest';

import input from './fixtures/input.json';
import outputData from './fixtures/output.json';
import { migrateSettingsToUser } from './index';
import { V4Settings } from './type';

describe('migrateSettingsFromLocalStorage', () => {
  it('from localStorage to indexedDB', () => {
    const output = migrateSettingsToUser(input as V4Settings);

    expect(output).toEqual(outputData);
  });
});
