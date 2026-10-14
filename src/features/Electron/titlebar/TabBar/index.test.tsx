import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TabBar from './index';

vi.mock('@lobechat/electron-client-ipc', () => ({ useWatchBroadcast: vi.fn() }));
vi.mock('@/features/Electron/TabHost', () => ({ captureVisibleTabPreviews: vi.fn() }));
vi.mock('@/hooks/useActiveLocation', () => ({
  useActiveLocation: () => ({ pathname: '/', search: '' }),
}));
vi.mock('@/hooks/useHotkeys/desktopTabScope', () => ({ useRegisterDesktopTabHotkeys: vi.fn() }));
vi.mock('@/hooks/usePermission', () => ({ usePermission: () => ({ allowed: true }) }));
vi.mock('@/services/electron/system', () => ({ electronSystemService: {} }));
vi.mock('@/store/electron', () => ({
  useElectronStore: (selector: (state: unknown) => unknown) => selector({ splitView: null }),
}));
vi.mock('@/store/user', () => ({
  useUserStore: (selector: (state: unknown) => unknown) => selector({}),
}));
vi.mock('@/store/user/selectors', () => ({
  labPreferSelectors: { enableDesktopSplitView: () => false },
}));
vi.mock('@/styles/electron', () => ({
  electronStylish: { draggable: 'draggable', nodrag: 'nodrag' },
}));
vi.mock('./hooks/useResolvedTabs', () => ({
  useResolvedTabs: () => ({
    activeTabId: 'tab-1',
    tabs: [{ meta: { title: 'Home' }, tab: { id: 'tab-1', url: '/' } }],
  }),
}));
vi.mock('./hooks/useStripWidth', () => ({ useStripWidth: () => [800, vi.fn()] }));
vi.mock('./TabItem', () => ({ default: () => <div data-testid="tab-item" /> }));

describe('TabBar', () => {
  it('keeps the empty strip area as a window drag region', () => {
    render(<TabBar />);

    const tab = screen.getByTestId('tab-item');
    const strip = tab.parentElement?.parentElement;

    expect(strip).toHaveClass('draggable');
    expect(strip).not.toHaveClass('nodrag');
  });
});
