import { ModelTag as DefaultModelTag } from '@lobehub/icons';
import { render, screen } from '@testing-library/react';
import { Mock, describe, expect, it, vi } from 'vitest';

import { useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';

import ModelTag from './index';

// Mock the dependencies
vi.mock('@/store/serverConfig', () => ({
  useServerConfigStore: vi.fn(),
  featureFlagsSelectors: {
    modelTagUseModelName: vi.fn(),
  },
}));

vi.mock('@/store/user', () => ({
  useUserStore: vi.fn(),
  modelProviderSelectors: {
    modelProviderListForModelSelect: vi.fn(),
  },
}));

vi.mock('@lobehub/icons', () => ({
  ModelTag: vi.fn(() => <div data-testid="default-model-tag" />),
  ModelIcon: vi.fn(({ type }) => <div data-testid="model-icon" data-type={type} />),
}));

describe('ModelTag', () => {
  it('should render DefaultModelTag when modelTagUseModelName is false', () => {
    (useServerConfigStore as Mock).mockReturnValue({ modelTagUseModelName: false });

    render(<ModelTag model="gpt-3.5-turbo" />);

    expect(screen.getByTestId('default-model-tag')).toBeInTheDocument();
  });

  it('should render CustomModelTag when modelTagUseModelName is true', () => {
    (useServerConfigStore as Mock).mockReturnValue({ modelTagUseModelName: true });
    (useUserStore as unknown as Mock).mockReturnValue([
      {
        id: 'openai',
        chatModels: [{ id: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo' }],
      },
    ]);

    render(<ModelTag model="gpt-3.5-turbo" />);

    expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
    expect(screen.getByTestId('model-icon')).toBeInTheDocument();
  });

  it('should use model name when no displayName is found', () => {
    (useServerConfigStore as Mock).mockReturnValue({ modelTagUseModelName: true });
    (useUserStore as unknown as Mock).mockReturnValue([
      {
        id: 'openai',
        chatModels: [],
      },
    ]);

    render(<ModelTag model="unknown-model" />);

    expect(screen.getByText('unknown-model')).toBeInTheDocument();
  });

  it('should find model in specific provider when providerId is provided', () => {
    (useServerConfigStore as Mock).mockReturnValue({ modelTagUseModelName: true });
    (useUserStore as unknown as Mock).mockReturnValue([
      {
        id: 'openai',
        chatModels: [{ id: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo' }],
      },
      {
        id: 'anthropic',
        chatModels: [{ id: 'claude-2', displayName: 'Claude 2' }],
      },
    ]);

    render(<ModelTag model="claude-2" providerId="anthropic" />);

    expect(screen.getByText('Claude 2')).toBeInTheDocument();
  });

  it('should use default type "mono" when not specified', () => {
    (useServerConfigStore as Mock).mockReturnValue({ modelTagUseModelName: true });
    (useUserStore as unknown as Mock).mockReturnValue([
      {
        id: 'openai',
        chatModels: [{ id: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo' }],
      },
    ]);

    render(<ModelTag model="gpt-3.5-turbo" />);

    expect(screen.getByTestId('model-icon')).toHaveAttribute('data-type', 'mono');
  });

  it('should use specified type when provided', () => {
    (useServerConfigStore as Mock).mockReturnValue({ modelTagUseModelName: true });
    (useUserStore as unknown as Mock).mockReturnValue([
      {
        id: 'openai',
        chatModels: [{ id: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo' }],
      },
    ]);

    render(<ModelTag model="gpt-3.5-turbo" type="color" />);

    expect(screen.getByTestId('model-icon')).toHaveAttribute('data-type', 'color');
  });
});
