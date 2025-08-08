import React from 'react';
import { renderWithTheme } from '@/test/utils';
import Toast from '../Toast';

jest.mock('lucide-react-native', () => ({
  CheckCircle: () => <div>✓</div>,
  XCircle: () => <div>✗</div>,
  Info: () => <div>i</div>,
  RefreshCw: () => <div>⟳</div>,
  X: () => <div>×</div>,
}));

describe('Toast', () => {
  it('renders success toast', () => {
    const { toJSON } = renderWithTheme(<Toast type="success" message="Success!" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders error toast', () => {
    const { toJSON } = renderWithTheme(<Toast type="error" message="Error!" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders info toast', () => {
    const { toJSON } = renderWithTheme(<Toast type="info" message="Info!" />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders loading toast', () => {
    const { toJSON } = renderWithTheme(<Toast type="loading" message="Loading..." />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with dismiss button', () => {
    const { toJSON } = renderWithTheme(<Toast type="success" message="Success!" dismissible />);
    expect(toJSON()).toBeTruthy();
  });
});
