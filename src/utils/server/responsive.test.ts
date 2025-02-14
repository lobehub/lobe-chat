import { describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: vi.fn((key) => {
        if (key === 'user-agent')
          return 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15';
        return null;
      }),
    }),
}));

describe('isMobileDevice', () => {
  it('should detect mobile device', async () => {
    const { isMobileDevice } = await import('./responsive');
    const result = await isMobileDevice();
    expect(result).toBe(true);
  });

  it('should throw error if called outside server', async () => {
    const processBackup = global.process;
    // @ts-ignore
    global.process = undefined;

    const { isMobileDevice } = await import('./responsive');

    await expect(isMobileDevice()).rejects.toThrow(
      '[Server method] you are importing a server-only module outside of server',
    );

    global.process = processBackup;
  });
});

describe('gerServerDeviceInfo', () => {
  it('should return device info', async () => {
    const { gerServerDeviceInfo } = await import('./responsive');
    const result = await gerServerDeviceInfo();
    expect(result).toEqual({
      browser: 'WebKit',
      isMobile: expect.any(Promise),
      os: 'iOS',
    });
  });

  it('should throw error if called outside server', async () => {
    const processBackup = global.process;
    // @ts-ignore
    global.process = undefined;

    const { gerServerDeviceInfo } = await import('./responsive');

    await expect(gerServerDeviceInfo()).rejects.toThrow(
      '[Server method] you are importing a server-only module outside of server',
    );

    global.process = processBackup;
  });
});
