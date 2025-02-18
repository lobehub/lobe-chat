import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUserStore } from '@/store/user';

import PanelContent from '../UserPanel/PanelContent';

// Mock dependencies
vi.mock('zustand/traditional');

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('@/components/BrandWatermark', () => ({
  default: vi.fn(() => <div>Mocked BrandWatermark</div>),
}));

vi.mock('@/components/Menu', () => ({
  default: vi.fn(({ items, onClick }) => (
    <div>
      Mocked Menu
      {items.map((item: any) => (
        <button key={item.key} onClick={onClick} type={'button'}>
          {item.label}
        </button>
      ))}
    </div>
  )),
}));

vi.mock('../UserInfo', () => ({
  default: vi.fn(({ onClick }) => (
    <button onClick={onClick} type={'button'}>
      Mocked UserInfo
    </button>
  )),
}));

vi.mock('../UserPanel/useMenu', () => ({
  useMenu: vi.fn(() => ({
    logoutItems: [{ key: 'logout', label: 'Logout' }],
    mainItems: [
      { key: 'item1', label: 'Main Item 1' },
      { key: 'item2', label: 'Main Item 2' },
    ],
  })),
}));

vi.mock('../UserLoginOrSignup', () => ({
  default: vi.fn(({ onClick }) => (
    <button onClick={onClick} type={'button'}>
      Mocked SignInBlock
    </button>
  )),
}));

vi.mock('../DataStatistics', () => ({
  default: vi.fn(() => <div>Mocked DataStatistics</div>),
}));

vi.mock('@/const/version', () => ({
  isDeprecatedEdition: false,
}));

// 定义一个变量来存储 enableAuth 的值
let enableAuth = true;

// 模拟 @/const/auth 模块
vi.mock('@/const/auth', () => ({
  get enableAuth() {
    return enableAuth;
  },
}));

describe('PanelContent', () => {
  const closePopover = vi.fn();

  describe('enable auth', () => {
    it('should render UserInfo when user is signed in', () => {
      act(() => {
        useUserStore.setState({ isSignedIn: true });
      });

      render(<PanelContent closePopover={closePopover} />);

      expect(screen.getByText('Mocked UserInfo')).toBeInTheDocument();
      expect(screen.getByText('Mocked DataStatistics')).toBeInTheDocument();
      expect(screen.queryByText('Mocked SignInBlock')).not.toBeInTheDocument();
    });

    it('should render SignInBlock when user is not signed in and enable auth', () => {
      act(() => {
        useUserStore.setState({ isSignedIn: false });
      });

      render(<PanelContent closePopover={closePopover} />);

      expect(screen.getByText('Mocked SignInBlock')).toBeInTheDocument();
      expect(screen.queryByText('Mocked DataStatistics')).not.toBeInTheDocument();
      expect(screen.queryByText('Mocked UserInfo')).not.toBeInTheDocument();
    });

    it('should render logout items when user is signed in', () => {
      act(() => {
        useUserStore.setState({ isSignedIn: true });
      });

      render(<PanelContent closePopover={closePopover} />);

      expect(screen.getAllByText('Mocked Menu').length).toBe(2);
    });

    it('should render BrandWatermark when user is not signed in', () => {
      act(() => {
        useUserStore.setState({ isSignedIn: false });
      });

      render(<PanelContent closePopover={closePopover} />);

      expect(screen.getByText('Mocked BrandWatermark')).toBeInTheDocument();
    });
  });

  describe('disable auth', () => {
    it('should render UserInfo', () => {
      act(() => {
        useUserStore.setState({ isSignedIn: true });
      });

      render(<PanelContent closePopover={closePopover} />);

      expect(screen.getByText('Mocked UserInfo')).toBeInTheDocument();
      expect(screen.getByText('Mocked DataStatistics')).toBeInTheDocument();
      expect(screen.queryByText('Mocked SignInBlock')).not.toBeInTheDocument();
    });

    it('should render BrandWatermark when disable auth', () => {
      enableAuth = false;

      act(() => {
        useUserStore.setState({ isSignedIn: false });
      });

      render(<PanelContent closePopover={closePopover} />);

      expect(screen.getByText('Mocked BrandWatermark')).toBeInTheDocument();
    });
  });

  it('should render Menu with main items', () => {
    render(<PanelContent closePopover={closePopover} />);

    expect(screen.getByText('Mocked Menu')).toBeInTheDocument();
  });
});
