import { describe, expect, it } from 'vitest';

import { desktopOnly } from './desktopOnly';

describe('desktopOnly', () => {
  it('throws with the service and method name when called', () => {
    const service = desktopOnly<{ someMethod: () => void }>('exampleService');

    expect(() => service.someMethod()).toThrow(
      'exampleService.someMethod is only available in the desktop app',
    );
  });

  it('resolves to the proxy instead of throwing when awaited', async () => {
    const service = desktopOnly<{ someMethod: () => void }>('exampleService');

    const resolved = await service;

    expect(resolved).toBe(service);
  });
});
