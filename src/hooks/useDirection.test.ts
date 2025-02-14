import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDirection } from './useDirection';

describe('useDirection', () => {
  it('should memoize the direction value', () => {
    const mockDirection = 'ltr';
    const mockContext = {
      direction: mockDirection,
      getPrefixCls: vi.fn(),
      iconPrefixCls: 'anticon',
      theme: undefined,
      space: undefined,
      autoInsertSpaceInButton: true,
      renderEmpty: vi.fn(),
      csp: undefined,
      virtual: true,
      popupOverflow: undefined,
    };

    vi.spyOn(React, 'useContext').mockReturnValue(mockContext);

    const { result, rerender } = renderHook(() => useDirection());

    const firstResult = result.current;
    rerender();

    expect(result.current).toBe(firstResult);
  });

  it('should handle undefined direction', () => {
    const mockContext = {
      direction: undefined,
      getPrefixCls: vi.fn(),
      iconPrefixCls: 'anticon',
      theme: undefined,
      space: undefined,
      autoInsertSpaceInButton: true,
      renderEmpty: vi.fn(),
      csp: undefined,
      virtual: true,
      popupOverflow: undefined,
    };

    vi.spyOn(React, 'useContext').mockReturnValue(mockContext);

    const { result } = renderHook(() => useDirection());

    expect(result.current).toBeUndefined();
  });
});
