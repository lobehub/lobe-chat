import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  Provider,
  createServerConfigStore,
  initServerConfigStore,
} from '@/store/serverConfig/store';

import Actions from './Actions';

beforeAll(() => {
  initServerConfigStore({ featureFlags: { market: true } });
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  createServerConfigStore().setState({ featureFlags: { market: true } });
  cleanup();
});

vi.mock('next/link', () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key) => key),
  })),
}));

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push,
  })),
}));

const renderActions = (props: { mobile?: boolean }) => {
  render(
    <Provider createStore={createServerConfigStore}>
      <Actions {...props} />
    </Provider>,
  );
};

describe('Welcome Actions', () => {
  it('should render Start and Market button', () => {
    renderActions({});

    expect(screen.getByText('button.start')).toBeInTheDocument();
    expect(screen.getByText('button.market')).toBeInTheDocument();
  });

  it('should render Start when `-market` is set', () => {
    act(() => {
      createServerConfigStore().setState({ featureFlags: { market: false } });
    });

    renderActions({});

    expect(screen.getByText('button.start')).toBeInTheDocument();
    expect(screen.queryByText('button.market')).not.toBeInTheDocument();
  });

  it('Clicking start button should push to `/chat`', () => {
    renderActions({});

    fireEvent.click(screen.getByText('button.start'));

    expect(push).toHaveBeenCalledWith('/chat');
  });
});
