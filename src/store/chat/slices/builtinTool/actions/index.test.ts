import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StoreApi } from 'zustand';

import { ChatStore } from '@/store/chat/store';

import { dalleSlice } from './dalle';
import { chatToolSlice } from './index';
import { searchSlice } from './searXNG';

// Mock the imported slices
vi.mock('./dalle', () => ({
  dalleSlice: vi.fn(),
}));

vi.mock('./searXNG', () => ({
  searchSlice: vi.fn(),
}));

describe('chatToolSlice', () => {
  // Create a mock store API
  const mockStoreApi = {
    setState: vi.fn((state: any) => {}),
    getState: vi.fn(),
    subscribe: vi.fn(),
    getInitialState: vi.fn(),
  } satisfies StoreApi<ChatStore>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should combine dalle and search slices', () => {
    // Mock return values for slices
    const mockDalleActions = {
      generateImageFromPrompts: vi.fn(),
      text2image: vi.fn(),
      toggleDallEImageLoading: vi.fn(),
      updateImageItem: vi.fn(),
      useFetchDalleImageItem: vi.fn(),
    };

    const mockSearchActions = {
      reSearchWithSearXNG: vi.fn(),
      saveSearXNGSearchResult: vi.fn(),
      searchWithSearXNG: vi.fn(),
      toggleSearchLoading: vi.fn(),
    };

    (dalleSlice as any).mockImplementation(() => mockDalleActions);
    (searchSlice as any).mockImplementation(() => mockSearchActions);

    // Create the combined slice
    const result = chatToolSlice(mockStoreApi.setState, mockStoreApi.getState, mockStoreApi);

    // Verify dalle slice was called with correct params
    expect(dalleSlice).toHaveBeenCalledWith(
      mockStoreApi.setState,
      mockStoreApi.getState,
      mockStoreApi,
    );

    // Verify search slice was called with correct params
    expect(searchSlice).toHaveBeenCalledWith(
      mockStoreApi.setState,
      mockStoreApi.getState,
      mockStoreApi,
    );

    // Verify the combined result contains all actions
    expect(result).toEqual({
      ...mockDalleActions,
      ...mockSearchActions,
    });
  });

  it('should maintain the correct types and structure for all actions', () => {
    // Mock implementations with complete action signatures
    const mockDalleActions = {
      generateImageFromPrompts: vi.fn(async (items: any[], id: string) => {}),
      text2image: vi.fn(async (id: string, data: any[]) => {}),
      toggleDallEImageLoading: vi.fn((key: string, value: boolean) => {}),
      updateImageItem: vi.fn(async (id: string, updater: (data: any[]) => void) => {}),
      useFetchDalleImageItem: vi.fn((id: string) => ({})),
    };

    const mockSearchActions = {
      reSearchWithSearXNG: vi.fn(
        async (id: string, data: any, options?: { aiSummary: boolean }) => {},
      ),
      saveSearXNGSearchResult: vi.fn(async (id: string) => {}),
      searchWithSearXNG: vi.fn(async (id: string, data: any, aiSummary?: boolean) => {}),
      toggleSearchLoading: vi.fn((id: string, loading: boolean) => {}),
    };

    (dalleSlice as any).mockImplementation(() => mockDalleActions);
    (searchSlice as any).mockImplementation(() => mockSearchActions);

    const mockActions = chatToolSlice(mockStoreApi.setState, mockStoreApi.getState, mockStoreApi);

    // Verify DALL-E actions
    expect(mockActions).toHaveProperty('generateImageFromPrompts');
    expect(typeof mockActions.generateImageFromPrompts).toBe('function');
    expect(mockActions).toHaveProperty('text2image');
    expect(typeof mockActions.text2image).toBe('function');
    expect(mockActions).toHaveProperty('toggleDallEImageLoading');
    expect(typeof mockActions.toggleDallEImageLoading).toBe('function');
    expect(mockActions).toHaveProperty('updateImageItem');
    expect(typeof mockActions.updateImageItem).toBe('function');
    expect(mockActions).toHaveProperty('useFetchDalleImageItem');
    expect(typeof mockActions.useFetchDalleImageItem).toBe('function');

    // Verify search actions
    expect(mockActions).toHaveProperty('reSearchWithSearXNG');
    expect(typeof mockActions.reSearchWithSearXNG).toBe('function');
    expect(mockActions).toHaveProperty('saveSearXNGSearchResult');
    expect(typeof mockActions.saveSearXNGSearchResult).toBe('function');
    expect(mockActions).toHaveProperty('searchWithSearXNG');
    expect(typeof mockActions.searchWithSearXNG).toBe('function');
    expect(mockActions).toHaveProperty('toggleSearchLoading');
    expect(typeof mockActions.toggleSearchLoading).toBe('function');

    // Verify no extra properties
    expect(Object.keys(mockActions).length).toBe(9);
  });
});
