// @vitest-environment edge-runtime
import { describe, expect, it } from 'vitest';

import { openAiPreferredRegion } from './config';

describe('Configuration tests', () => {
  it('should contain specific regions in preferredRegion', () => {
    expect(openAiPreferredRegion).not.contain(['hkg1']);
  });
});
