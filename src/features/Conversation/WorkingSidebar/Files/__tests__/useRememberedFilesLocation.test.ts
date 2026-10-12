import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  FILES_LOCATION_STORAGE_KEY,
  type FilesLocation,
  useRememberedFilesLocation,
} from '../useRememberedFilesLocation';

const render = (initial: { contextKey?: string; resolved?: FilesLocation; settled: boolean }) =>
  renderHook(
    ({ contextKey, resolved, settled }) =>
      useRememberedFilesLocation(contextKey, resolved, settled),
    { initialProps: initial },
  );

beforeEach(() => {
  localStorage.clear();
});

describe('useRememberedFilesLocation', () => {
  it('opens where the conversation last was until the device list settles', () => {
    localStorage.setItem(
      FILES_LOCATION_STORAGE_KEY,
      JSON.stringify({ 'topic:t1': { deviceId: 'device-1', directory: '/repo' } }),
    );

    // Before the device default is known the live resolution is the home fallback.
    const { rerender, result } = render({
      contextKey: 'topic:t1',
      resolved: { directory: '/Users/me' },
      settled: false,
    });
    expect(result.current).toEqual({ deviceId: 'device-1', directory: '/repo' });

    rerender({
      contextKey: 'topic:t1',
      resolved: { deviceId: 'device-1', directory: '/repo/next' },
      settled: true,
    });
    expect(result.current).toEqual({ deviceId: 'device-1', directory: '/repo/next' });
    expect(JSON.parse(localStorage.getItem(FILES_LOCATION_STORAGE_KEY)!)).toEqual({
      'topic:t1': { deviceId: 'device-1', directory: '/repo/next' },
    });
  });

  it('uses the live resolution when nothing was remembered for this context', () => {
    localStorage.setItem(
      FILES_LOCATION_STORAGE_KEY,
      JSON.stringify({ 'topic:other': { directory: '/elsewhere' } }),
    );

    const { result } = render({
      contextKey: 'topic:t1',
      resolved: { directory: '/repo' },
      settled: false,
    });

    expect(result.current).toEqual({ directory: '/repo' });
  });

  it('does not remember an unsettled resolution', () => {
    render({ contextKey: 'topic:t1', resolved: { directory: '/Users/me' }, settled: false });

    expect(localStorage.getItem(FILES_LOCATION_STORAGE_KEY)).toBeNull();
  });

  it('passes the resolution through when there is no context to remember', () => {
    const { result } = render({ resolved: { directory: '' }, settled: false });

    expect(result.current).toEqual({ directory: '' });
  });
});
