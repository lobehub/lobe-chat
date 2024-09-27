import { ModelTag as DefaultModelTag } from '@lobehub/icons';
import { render, screen } from '@testing-library/react';
import { Mock, describe, expect, it, vi } from 'vitest';

import { useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';

import ModelTag from './index';

// Mock the dependencies
vi.mock('@/store/serverConfig', () => ({
  useServerConfigStore: vi.fn(),
  featureFlagsSelectors: vi.fn(),
}));

vi.mock('@/store/user', () => ({
  useUserStore: vi.fn(),
}));

vi.mock('@lobehub/icons', () => ({
  ModelTag: vi.fn(() => <div data-testid="default-model-tag" />),
  ModelIcon: vi.fn(() => <div data-testid="model-icon" />),
}));

describe('ModelTag', () => {
  it('should render DefaultModelTag when useModelName is false', () => {
    (useServerConfigStore as Mock).mockReturnValue({ useModelName: false });

    render(<ModelTag model="gpt-3.5-turbo" />);

    expect(screen.getByTestId('default-model-tag')).toBeInTheDocument();
  });

  it('should render CustomModelTag when useModelName is true', () => {
    (useServerConfigStore as Mock).mockReturnValue({ useModelName: true });
    (useUserStore as unknown as Mock).mockReturnValue([
      {
        chatModels: [{ id: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo' }],
      },
    ]);

    render(<ModelTag model="gpt-3.5-turbo" />);

    expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
    expect(screen.getByTestId('model-icon')).toBeInTheDocument();
  });

  it('should use model name when no displayName is found', () => {
    (useServerConfigStore as Mock).mockReturnValue({ useModelName: true });
    (useUserStore as unknown as Mock).mockReturnValue([
      {
        chatModels: [],
      },
    ]);

    render(<ModelTag model="unknown-model" />);

    expect(screen.getByText('unknown-model')).toBeInTheDocument();
  });
});
