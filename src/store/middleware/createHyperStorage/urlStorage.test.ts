import { beforeEach, describe, expect, it, vi } from 'vitest';

import { creatUrlStorage } from './urlStorage';

// Mock global location and history objects
const mockLocation = {
  hash: '',
  search: '',
};
const mockHistory = {
  replaceState: vi.fn(),
};

global.location = mockLocation as Location;
global.history = mockHistory as any as History;

describe('creatUrlStorage', () => {
  beforeEach(() => {
    // Reset all mocks and location properties before each test
    vi.resetAllMocks();
    mockLocation.hash = '';
    mockLocation.search = '';
  });

  it('getItem should return the correct state from URL hash', () => {
    mockLocation.hash = '#key1=value1&key2=value2';
    const storage = creatUrlStorage('hash');
    const result = storage.getItem();

    expect(result).toEqual({ state: { key1: 'value1', key2: 'value2' } });
  });

  it('getItem should return the correct state from URL search', () => {
    mockLocation.search = '?key1=value1&key2=value2';
    const storage = creatUrlStorage('search');
    const result = storage.getItem();

    expect(result).toEqual({ state: { key1: 'value1', key2: 'value2' } });
  });

  it('getItem should return undefined if no state in URL', () => {
    const storage = creatUrlStorage('hash');
    const result = storage.getItem();

    expect(result).toBeUndefined();
  });

  it('removeItem should remove a specific key from URL hash', () => {
    mockLocation.hash = '#key1=value1&key2=value2';
    const storage = creatUrlStorage('hash');
    storage.removeItem('key1');

    expect(location.hash).toEqual('key2=value2');
  });

  it('removeItem should remove a specific key from URL search', () => {
    mockLocation.search = '?key1=value1&key2=value2';
    const storage = creatUrlStorage('search');
    storage.removeItem('key1');

    expect(mockHistory.replaceState).toHaveBeenCalledWith({}, '', '?key2=value2');
  });

  it('setItem should set state in URL hash', () => {
    const storage = creatUrlStorage('hash');
    storage.setItem('state', { key1: 'value1', key2: 'value2', key3: 1, key4: false });

    expect(location.hash).toEqual('key1=value1&key2=value2&key3=1&key4=0');
  });

  it('setItem should set state in URL search', () => {
    const storage = creatUrlStorage('search');
    storage.setItem('state', { key1: 'value1', key2: 'value2' });

    expect(mockHistory.replaceState).toHaveBeenCalledWith({}, '', '?key1=value1&key2=value2');
  });

  it('setItem should handle non-string values by JSON stringifying them', () => {
    const storage = creatUrlStorage('hash');
    storage.setItem('state', { key1: { nested: 'value' }, key2: 123, key4: {} });

    expect(location.hash).toEqual(`key1=%7B%22nested%22%3A%22value%22%7D&key2=123`);
  });
});
