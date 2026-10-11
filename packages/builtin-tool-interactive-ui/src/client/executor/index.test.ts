import type { BuiltinToolContext } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { interactiveUIExecutor } from './index';

describe('interactive UI client executor', () => {
  it('executes through the real BaseExecutor dispatcher', async () => {
    const result = await interactiveUIExecutor.invoke(
      'renderUI',
      {
        css: '',
        fallback: 'Example',
        html: '<p>Example</p>',
        js: '',
        title: 'Example',
        version: 1,
      },
      {} as BuiltinToolContext,
    );
    expect(result.success).toBe(true);
    expect(result.state).toEqual({ status: 'ready', version: 1 });
  });
});
