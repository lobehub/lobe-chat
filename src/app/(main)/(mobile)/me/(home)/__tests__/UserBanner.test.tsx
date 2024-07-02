import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUserStore } from '@/store/user';

import UserBanner from '../features/UserBanner';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('@/features/User/UserInfo', () => ({
  default: vi.fn(() => <div>Mocked UserInfo</div>),
}));

vi.mock('@/features/User/DataStatistics', () => ({
  default: vi.fn(() => <div>Mocked DataStatistics</div>),
}));

vi.mock('@/features/User/UserLoginOrSignup/Community', () => ({
  default: vi.fn(() => <div>Mocked UserLoginOrSignup</div>),
}));

// 定义一个变量来存储 enableAuth 的值
let enableAuth = true;
let enableClerk = false;

// 模拟 @/const/auth 模块
vi.mock('@/const/auth', () => ({
  get enableAuth() {
    return enableAuth;
  },
  get enableClerk() {
    return enableClerk;
  },
}));

afterEach(() => {
  enableAuth = true;
});

describe('UserBanner', () => {
  it('should render UserInfo and DataStatistics when auth is disabled', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: false, enableAuth: () => false });
    });

    render(<UserBanner />);

    expect(screen.getByText('Mocked UserInfo')).toBeInTheDocument();
    expect(screen.getByText('Mocked DataStatistics')).toBeInTheDocument();
    expect(screen.queryByText('Mocked UserLoginOrSignup')).not.toBeInTheDocument();
  });

  it('should render UserInfo and DataStatistics when user is logged in with auth enabled', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: true });
    });

    enableClerk = true;

    render(<UserBanner />);

    expect(screen.getByText('Mocked UserInfo')).toBeInTheDocument();
    expect(screen.getByText('Mocked DataStatistics')).toBeInTheDocument();
    expect(screen.queryByText('Mocked UserLoginOrSignup')).not.toBeInTheDocument();
  });

  it('should render UserLoginOrSignup when user is not logged in with auth enabled', () => {
    act(() => {
      useUserStore.setState({ isSignedIn: false, enableAuth: () => true });
    });
    enableClerk = true;

    render(<UserBanner />);

    expect(screen.getByText('Mocked UserLoginOrSignup')).toBeInTheDocument();
    expect(screen.queryByText('Mocked UserInfo')).not.toBeInTheDocument();
    expect(screen.queryByText('Mocked DataStatistics')).not.toBeInTheDocument();
  });
});
