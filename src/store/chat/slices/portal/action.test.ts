import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useChatStore } from '@/store/chat';

vi.mock('zustand/traditional');

describe('chatDockSlice', () => {
  describe('closeToolUI', () => {
    it('should set dockToolMessage to undefined', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.openToolUI('test-id', 'test-identifier');
      });

      expect(result.current.dockToolMessage).toEqual({
        id: 'test-id',
        identifier: 'test-identifier',
      });

      act(() => {
        result.current.closeToolUI();
      });

      expect(result.current.dockToolMessage).toBeUndefined();
    });
  });

  describe('openToolUI', () => {
    it('should set dockToolMessage and open dock if it is closed', () => {
      const { result } = renderHook(() => useChatStore());

      expect(result.current.showDock).toBe(false);

      act(() => {
        result.current.openToolUI('test-id', 'test-identifier');
      });

      expect(result.current.dockToolMessage).toEqual({
        id: 'test-id',
        identifier: 'test-identifier',
      });
      expect(result.current.showDock).toBe(true);
    });

    it('should not change dock state if it is already open', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.toggleDock(true);
      });

      expect(result.current.showDock).toBe(true);

      act(() => {
        result.current.openToolUI('test-id', 'test-identifier');
      });

      expect(result.current.dockToolMessage).toEqual({
        id: 'test-id',
        identifier: 'test-identifier',
      });
      expect(result.current.showDock).toBe(true);
    });
  });

  describe('toggleDock', () => {
    it('should toggle dock state when no argument is provided', () => {
      const { result } = renderHook(() => useChatStore());

      expect(result.current.showDock).toBe(false);

      act(() => {
        result.current.toggleDock();
      });

      expect(result.current.showDock).toBe(true);

      act(() => {
        result.current.toggleDock();
      });

      expect(result.current.showDock).toBe(false);
    });

    it('should set dock state to the provided value', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.toggleDock(true);
      });

      expect(result.current.showDock).toBe(true);

      act(() => {
        result.current.toggleDock(false);
      });

      expect(result.current.showDock).toBe(false);

      act(() => {
        result.current.toggleDock(true);
      });

      expect(result.current.showDock).toBe(true);
    });
  });
});
