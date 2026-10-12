import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deviceService } from '@/services/device';

import { isValidFolderName, useCreateFolder } from './useCreateFolder';

vi.mock('@/services/device', () => ({
  deviceService: { createDirectory: vi.fn() },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const setup = () => {
  const onCreated = vi.fn();
  const hook = renderHook(() =>
    useCreateFolder({ deviceId: 'device', onCreated, parentPath: '/home/me' }),
  );
  const submitName = async (name: string) => {
    act(() => hook.result.current.setName(name));
    await act(() => hook.result.current.submit());
  };
  return { hook, onCreated, submitName };
};

describe('useCreateFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('creates the trimmed name inside the browsed folder and reports the new path', async () => {
    vi.mocked(deviceService.createDirectory).mockResolvedValue({
      path: '/home/me/new-project',
      success: true,
    });
    const { hook, onCreated, submitName } = setup();

    await submitName(' new-project ');

    expect(deviceService.createDirectory).toHaveBeenCalledWith({
      deviceId: 'device',
      name: 'new-project',
      parentPath: '/home/me',
    });
    expect(onCreated).toHaveBeenCalledWith('/home/me/new-project');
    expect(hook.result.current.error).toBeUndefined();
    expect(hook.result.current.pending).toBe(false);
  });

  it('reports a taken name with a dedicated message', async () => {
    vi.mocked(deviceService.createDirectory).mockRejectedValue({ data: { code: 'CONFLICT' } });
    const { hook, onCreated, submitName } = setup();

    await submitName('existing');

    expect(hook.result.current.error).toBe('workingDirectory.newFolderExists');
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('asks for a device app update when the device lacks folder creation', async () => {
    vi.mocked(deviceService.createDirectory).mockRejectedValue({
      data: { code: 'PRECONDITION_FAILED' },
    });
    const { hook, submitName } = setup();

    await submitName('new');

    expect(hook.result.current.error).toBe('workingDirectory.newFolderUnsupported');
  });

  it('reports other failures with the generic message', async () => {
    vi.mocked(deviceService.createDirectory).mockRejectedValue(new Error('offline'));
    const { hook, submitName } = setup();

    await submitName('new');

    expect(hook.result.current.error).toBe('workingDirectory.newFolderFailed');
  });

  it('rejects an invalid name without reaching the device', async () => {
    const { hook, submitName } = setup();

    await submitName('a/b');

    expect(hook.result.current.error).toBe('workingDirectory.newFolderInvalidName');
    expect(deviceService.createDirectory).not.toHaveBeenCalled();
  });

  it('ignores a blank name and clears the error when the name is edited', async () => {
    const { hook, submitName } = setup();

    await submitName('..');
    expect(hook.result.current.error).toBe('workingDirectory.newFolderInvalidName');

    act(() => hook.result.current.setName('   '));
    expect(hook.result.current.error).toBeUndefined();
    await act(() => hook.result.current.submit());
    expect(deviceService.createDirectory).not.toHaveBeenCalled();
  });
});

describe('isValidFolderName', () => {
  it.each(['project', 'my project', '.config'])('accepts %j', (name) => {
    expect(isValidFolderName(name)).toBe(true);
  });

  it.each(['', '.', '..', 'a/b', 'a\\b', 'a\0b'])('rejects %j', (name) => {
    expect(isValidFolderName(name)).toBe(false);
  });
});
