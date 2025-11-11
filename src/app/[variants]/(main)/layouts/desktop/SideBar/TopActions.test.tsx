import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { SESSION_CHAT_URL } from '@/const/url';
import { DEFAULT_FEATURE_FLAGS, mapFeatureFlagsEnvToState } from '@/config/featureFlags';
import { useGlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import {
  Provider,
  createServerConfigStore,
  initServerConfigStore,
} from '@/store/serverConfig/store';
import { useSessionStore } from '@/store/session';

import TopActions, { TopActionProps } from './TopActions';

beforeAll(() => {
  initServerConfigStore({
    featureFlags: {
      ...mapFeatureFlagsEnvToState(DEFAULT_FEATURE_FLAGS),
      showMarket: true,
      showAiImage: true,
    },
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  createServerConfigStore().setState({
    featureFlags: {
      ...createServerConfigStore().getState().featureFlags,
      showMarket: true,
      showAiImage: true,
    },
  });
  cleanup();
});

vi.mock('react-router-dom', () => ({
  Link: vi.fn(({ children, to, ...rest }: { children: React.ReactNode; to: string }) => (
    <div {...rest}>
      {`Mocked Link ${to}`}
      {children}
    </div>
  )),
}));

vi.mock('@lobehub/ui', () => ({
  ActionIcon: vi.fn(({ title }) => <div>{title}</div>),
  combineKeys: vi.fn((keys) => keys.join('+')),
  KeyMapEnum: { Alt: 'alt', Ctrl: 'ctrl', Shift: 'shift' },
  Hotkey: vi.fn(({ keys = [] }) => <div>{keys}</div>),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key) => key),
  })),
}));

const renderTopActions = (props: TopActionProps = {}) => {
  render(
    <Provider createStore={createServerConfigStore}>
      <TopActions {...props} />
    </Provider>,
  );
};

describe('TopActions', () => {
  it('should render Chat, AI Image and Market by default', () => {
    renderTopActions();

    expect(screen.getByText('tab.chat')).toBeInTheDocument();
    expect(screen.getByText('tab.aiImage')).toBeInTheDocument();
    expect(screen.getByText('tab.discover')).toBeInTheDocument();
  });

  it('should render only Chat icon when `-market` is set', () => {
    act(() => {
      createServerConfigStore().setState({
        featureFlags: {
          ...createServerConfigStore().getState().featureFlags,
          showMarket: false,
        },
      });
    });

    renderTopActions();

    expect(screen.getByText('tab.chat')).toBeInTheDocument();
    expect(screen.queryByText('tab.discover')).not.toBeInTheDocument();
  });

  it('should render File icon when `-knowledge_base` is set', () => {
    act(() => {
      createServerConfigStore().setState({
        featureFlags: {
          ...createServerConfigStore().getState().featureFlags,
          enableKnowledgeBase: false,
        },
      });
    });

    renderTopActions();

    expect(screen.getByText('tab.chat')).toBeInTheDocument();
    expect(screen.queryByText('tab.files')).not.toBeInTheDocument();
  });

  it('should not render AI Image icon when ai_image is disabled', () => {
    act(() => {
      createServerConfigStore().setState({
        featureFlags: {
          ...createServerConfigStore().getState().featureFlags,
          showAiImage: false,
        },
      });
    });

    renderTopActions();

    expect(screen.getByText('tab.chat')).toBeInTheDocument();
    expect(screen.queryByText('tab.aiImage')).not.toBeInTheDocument();
  });

  it('should switch back to previous active session', () => {
    act(() => {
      useSessionStore.setState({ activeId: '1' });
    });

    const { result: store } = renderHook(() => useGlobalStore((s) => s));
    const switchBackToChat = vi.spyOn(store.current, 'switchBackToChat');

    renderTopActions({ tab: SidebarTabKey.Discover });
    const chatHref = SESSION_CHAT_URL('1');
    fireEvent.click(screen.getByText(`Mocked Link ${chatHref}`));

    expect(switchBackToChat).toBeCalledWith('1');
  });
});
