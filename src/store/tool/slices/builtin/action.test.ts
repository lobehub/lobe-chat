import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useToolStore } from '../../store';

vi.mock('zustand/traditional');

describe('createBuiltinToolSlice', () => {
  describe('transformApiArgumentsToAiState', () => {
    it('should return early if the tool is already loading', async () => {
      // Given
      const key = 'mockTool';
      const params = { test: 'data' };

      const mockFn = vi.fn();
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          builtinToolLoading: { [key]: true },
          mockTool: mockFn,
        } as any);
      });

      await act(async () => {
        // When
        const data = await result.current.transformApiArgumentsToAiState(key, params);
        expect(data).toBeUndefined();
      });

      // Then - should not call the action if already loading
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should invoke the specified tool action and return the stringified result', async () => {
      // Given
      const key = 'mockTool';
      const mockResult = { success: true, data: 'test result' };
      const mockFn = vi.fn().mockResolvedValue(mockResult);
      const { result } = renderHook(() => useToolStore());

      const params = {
        input: 'test input',
        option: 'value',
      };

      act(() => {
        useToolStore.setState({
          builtinToolLoading: { [key]: false },
          mockTool: mockFn,
        } as any);
      });

      // When
      let resultData: string | undefined;
      await act(async () => {
        resultData = await result.current.transformApiArgumentsToAiState(key, params);
      });

      // Then
      expect(mockFn).toHaveBeenCalledWith({
        input: 'test input',
        option: 'value',
      });
      expect(resultData).toBe(JSON.stringify(mockResult));
    });

    it('should return stringified params if action does not exist', async () => {
      // Given
      const key = 'nonExistentTool';
      const params = { test: 'data' };
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          builtinToolLoading: {},
        });
      });

      // When
      let resultData: string | undefined;
      await act(async () => {
        resultData = await result.current.transformApiArgumentsToAiState(key, params);
      });

      // Then
      expect(resultData).toBe(JSON.stringify(params));
    });

    it('should handle errors and toggle loading state', async () => {
      // Given
      const key = 'mockTool';
      const params = { test: 'data' };
      const error = new Error('Tool execution failed');
      const mockFn = vi.fn().mockRejectedValue(error);
      const { result } = renderHook(() => useToolStore());

      act(() => {
        useToolStore.setState({
          builtinToolLoading: { [key]: false },
          mockTool: mockFn,
        } as any);
      });

      // When/Then
      await act(async () => {
        await expect(result.current.transformApiArgumentsToAiState(key, params)).rejects.toThrow(
          'Tool execution failed',
        );
      });

      // Should have toggled loading state back to false
      expect(result.current.builtinToolLoading[key]).toBe(false);
    });
  });

  describe('toggleBuiltinToolLoading', () => {
    it('should toggle the loading state for a tool', () => {
      const { result } = renderHook(() => useToolStore());
      const key = 'testTool';

      act(() => {
        result.current.toggleBuiltinToolLoading(key, true);
      });

      expect(result.current.builtinToolLoading[key]).toBe(true);

      act(() => {
        result.current.toggleBuiltinToolLoading(key, false);
      });

      expect(result.current.builtinToolLoading[key]).toBe(false);
    });
  });
});
