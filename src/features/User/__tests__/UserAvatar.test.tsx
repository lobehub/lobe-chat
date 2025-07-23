import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_USER_AVATAR_URL } from '@/const/meta';
import { useUserStore } from '@/store/user';

import UserAvatar from '../UserAvatar';

vi.mock('zustand/traditional');

// 定义一个变量来存储 enableAuth 的值
let enableAuth = true;

// 模拟 @/const/auth 模块
vi.mock('@/const/auth', () => ({
  get enableAuth() {
    return enableAuth;
  },
}));

afterEach(() => {
  enableAuth = true;
});

describe('UserAvatar', () => {
  describe('enable Auth', () => {
    it('should show the username and avatar are displayed when the user is logged in', async () => {
      const mockAvatar = 'https://example.com/avatar.png';
      const mockUsername = 'teeeeeestuser';

      act(() => {
        useUserStore.setState({
          enableAuth: () => true,
          isSignedIn: true,
          user: { avatar: mockAvatar, id: 'abc', username: mockUsername },
        });
      });

      render(<UserAvatar />);

      expect(screen.getByAltText(mockUsername)).toBeInTheDocument();
      expect(screen.getByAltText(mockUsername)).toHaveAttribute('src', mockAvatar);
    });

    it('should show default avatar when the user is logged in but have no custom avatar', () => {
      const mockUsername = 'testuser';

      act(() => {
        useUserStore.setState({
          enableAuth: () => true,
          isSignedIn: true,
          user: { id: 'bbb', username: mockUsername },
        });
      });

      render(<UserAvatar />);
      expect(screen.getByAltText('testuser')).toHaveAttribute('src', DEFAULT_USER_AVATAR_URL);
    });

    it('should show LobeChat and default avatar when the user is not logged in and enable auth', () => {
      act(() => {
        useUserStore.setState({ enableAuth: () => true, isSignedIn: false, user: undefined });
      });

      render(<UserAvatar />);
      expect(screen.getByAltText('LobeChat')).toBeInTheDocument();
      expect(screen.getByAltText('LobeChat')).toHaveAttribute('src', DEFAULT_USER_AVATAR_URL);
    });
  });

  describe('disable Auth', () => {
    it('should show LobeChat and default avatar when the user is not logged in and disabled auth', () => {
      enableAuth = false;
      act(() => {
        useUserStore.setState({ enableAuth: () => false, isSignedIn: false, user: undefined });
      });

      render(<UserAvatar />);
      expect(screen.getByAltText('LobeChat')).toBeInTheDocument();
      expect(screen.getByAltText('LobeChat')).toHaveAttribute('src', DEFAULT_USER_AVATAR_URL);
    });
  });
});
