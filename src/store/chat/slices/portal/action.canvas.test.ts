import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import { PortalViewType } from './initialState';

describe('openCanvas', () => {
  it('opens an existing canvas even when the Canvas lab is off', () => {
    const { result } = renderHook(() => useChatStore());

    act(() => {
      result.current.clearPortalStack();
      result.current.openCanvas('cvs_1', 2);
    });

    expect(chatPortalSelectors.canvasView(result.current)).toEqual({
      canvasId: 'cvs_1',
      type: PortalViewType.Canvas,
      version: 2,
    });
  });
});
