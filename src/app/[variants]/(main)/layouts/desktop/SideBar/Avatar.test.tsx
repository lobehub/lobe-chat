import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useUserStore } from '@/store/user';

import Avatar from './Avatar';

// Mock UserAvatar and UserPanel components
vi.mock('@/features/User/UserAvatar', () => ({
  default: vi.fn(() => <div>Mocked UserAvatar</div>),
}));

vi.mock('@/features/User/UserPanel', () => ({
  default: vi.fn(({ children }) => <div>Mocked UserPanel {children}</div>),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Avatar', () => {
  it('should render UserAvatar and UserPanel when hideSettingsMoveGuide is true', () => {
    render(<Avatar />);

    expect(screen.getByText('Mocked UserPanel')).toBeInTheDocument();
    expect(screen.getByText('Mocked UserAvatar')).toBeInTheDocument();
    expect(screen.queryByText('userPanel.moveGuide')).not.toBeInTheDocument();
  });

  it('should render Tooltip with guide content when hideSettingsMoveGuide is false', () => {
    act(() => {
      useUserStore.getState().updateGuideState({ moveSettingsToAvatar: false });
    });

    render(<Avatar />);

    expect(screen.getByText('userPanel.moveGuide')).toBeInTheDocument();
    expect(screen.getByText('Mocked UserPanel')).toBeInTheDocument();
    expect(screen.getByText('Mocked UserAvatar')).toBeInTheDocument();
  });

  it('should call updateGuideState when close icon is clicked in Tooltip', () => {
    const updateGuideStateMock = vi.fn();
    act(() => {
      useUserStore.getState().updateGuideState({ moveSettingsToAvatar: false });
      useUserStore.setState({ updateGuideState: updateGuideStateMock });
    });

    render(<Avatar />);

    fireEvent.click(screen.getByRole('close-guide'));

    expect(updateGuideStateMock).toHaveBeenCalledWith({ moveSettingsToAvatar: true });
  });
});
