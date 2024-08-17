import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SidebarTabKey } from '@/store/global/initialState';
import { useServerConfigStore } from '@/store/serverConfig';

import TopActions from './TopActions';

// Mock the required modules and hooks
vi.mock('next/link', () => ({
  default: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
}));

vi.mock('@lobehub/ui', () => ({
  ActionIcon: ({ icon: Icon, title }: any) => (
    <div role="button" title={title}>
      <Icon data-testid={`icon-${title}`} />
    </div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/store/global', () => ({
  useGlobalStore: vi.fn(),
}));

vi.mock('@/store/serverConfig', () => ({
  useServerConfigStore: vi.fn(),
  featureFlagsSelectors: {},
}));

describe('TopActions', () => {
  const switchBackToChat = vi.fn();

  it('should render chat and market icons by default', () => {
    vi.mocked(useServerConfigStore).mockReturnValue({ enableKnowledgeBase: false });

    render(<TopActions />);

    expect(screen.getByTitle('tab.chat')).toBeInTheDocument();
    expect(screen.getByTitle('tab.market')).toBeInTheDocument();
    expect(screen.queryByTitle('tab.files')).not.toBeInTheDocument();
  });

  it('should render files icon when enableKnowledgeBase is true', () => {
    vi.mocked(useServerConfigStore).mockReturnValue({ enableKnowledgeBase: true });

    render(<TopActions />);

    expect(screen.getByTitle('tab.chat')).toBeInTheDocument();
    expect(screen.getByTitle('tab.files')).toBeInTheDocument();
    expect(screen.getByTitle('tab.market')).toBeInTheDocument();
  });
});
