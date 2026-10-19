import { describe, expect, it } from 'vitest';

import {
  getCreateEnvironmentFeedback,
  toCreateEnvironmentFailure,
  validateEnvironmentName,
} from './environmentName';

describe('environment name validation', () => {
  it.each(['', ' \t\n '])('rejects an empty trimmed name', (name) => {
    expect(validateEnvironmentName(name)).toBe('required');
  });

  it.each(['测', '中文 🧪 !', 'a'.repeat(255), `  ${'a'.repeat(255)}  `])(
    'accepts a valid trimmed name',
    (name) => {
      expect(validateEnvironmentName(name)).toBeUndefined();
    },
  );

  it.each([256, 1024])('explains an overlong %i-character name', (length) => {
    expect(validateEnvironmentName('x'.repeat(length))).toBe('tooLong');
  });

  it('allows correcting an overlong draft without truncating it', () => {
    const draft = 'x'.repeat(1024);
    expect(validateEnvironmentName(draft)).toBe('tooLong');
    expect(draft).toHaveLength(1024);
    expect(validateEnvironmentName('corrected name')).toBeUndefined();
  });

  it('matches the server UTF-16 length for emoji at the boundary', () => {
    expect(validateEnvironmentName(`${'x'.repeat(253)}🧪`)).toBeUndefined();
    expect(validateEnvironmentName(`${'x'.repeat(254)}🧪`)).toBe('tooLong');
  });
});

describe('create environment feedback', () => {
  it('classifies a taken name as a duplicate and anything else as a generic failure', () => {
    expect(toCreateEnvironmentFailure(new Error('DUPLICATE_ENVIRONMENT_NAME'))).toBe(
      'duplicateName',
    );
    expect(toCreateEnvironmentFailure(new Error('INTERNAL_SERVER_ERROR'))).toBe('createFailed');
    expect(toCreateEnvironmentFailure(undefined)).toBe('createFailed');
  });

  it('keeps a generic create failure off the name field', () => {
    expect(getCreateEnvironmentFeedback('valid name', 'createFailed')).toEqual({
      form: 'createFailed',
    });
  });

  it('attributes length and duplicate errors to the name field', () => {
    expect(getCreateEnvironmentFeedback('x'.repeat(256), undefined)).toEqual({ field: 'tooLong' });
    expect(getCreateEnvironmentFeedback('taken', 'duplicateName')).toEqual({
      field: 'duplicateName',
    });
  });

  it('reports nothing for a valid name with no failure', () => {
    expect(getCreateEnvironmentFeedback('valid name', undefined)).toEqual({});
  });
});
