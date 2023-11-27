import { render, screen } from '@testing-library/react';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/chatMessage';

import { AssistantMessageExtra } from './Assistant';

// Mock TTS and Translate components
vi.mock('./TTS', () => ({
  default: vi.fn(() => <div>TTS Component</div>),
}));
vi.mock('./Translate', () => ({
  default: vi.fn(() => <div>Translate Component</div>),
}));

// Mock dependencies
vi.mock('@/store/session', () => ({
  useSessionStore: vi.fn(),
}));
vi.mock('@/store/session/selectors', () => ({
  agentSelectors: {
    currentAgentModel: vi.fn(),
  },
}));

const mockData: ChatMessage = {
  content: 'test-content',
  createdAt: 0,
  id: 'abc',
  meta: { avatar: '', backgroundColor: '', description: '', tags: [], title: '' },
  role: 'assistant',
  updatedAt: 0,
};

describe('AssistantMessageExtra', () => {
  beforeEach(() => {
    // Set default mock return values
    (useSessionStore as unknown as Mock).mockImplementation(() => ({
      chatLoadingId: null,
    }));
    (agentSelectors.currentAgentModel as Mock).mockReturnValue('defaultModel');
  });

  it('should not render content if extra is undefined', async () => {
    render(<AssistantMessageExtra {...mockData} />);
    expect(screen.queryByText('defaultModel')).toBeNull();
    expect(screen.queryByText('TTS Component')).toBeNull();
    expect(screen.queryByText('Translate Component')).toBeNull();
  });

  it('should not render content if extra is defined but does not contain fromModel, tts, or translate', async () => {
    render(<AssistantMessageExtra {...mockData} />);
    expect(screen.queryByText('defaultModel')).toBeNull();
    expect(screen.queryByText('TTS Component')).toBeNull();
    expect(screen.queryByText('Translate Component')).toBeNull();
  });

  it('should render Tag component if extra.fromModel exists and does not match the current model', async () => {
    render(<AssistantMessageExtra {...mockData} extra={{ fromModel: 'otherModel' }} />);

    expect(screen.getByText('otherModel')).toBeInTheDocument();
  });

  it('should render TTS component if extra.fromModel and extra.tts coexist', async () => {
    render(<AssistantMessageExtra {...mockData} extra={{ fromModel: 'otherModel', tts: {} }} />);

    expect(screen.getByText('otherModel')).toBeInTheDocument();
    expect(screen.getByText('TTS Component')).toBeInTheDocument();
  });

  it('should render Translate component if extra.translate exists', async () => {
    render(<AssistantMessageExtra {...mockData} extra={{ translate: { to: 'abc' } }} />);
    expect(screen.getByText('Translate Component')).toBeInTheDocument();
  });

  it('should receive the correct loading attribute if loading is true for TTS and Translate components', async () => {
    (useSessionStore as unknown as Mock).mockImplementation(() => ({
      chatLoadingId: 'test-id',
    }));
    render(<AssistantMessageExtra {...mockData} extra={{ translate: { to: 'abc' }, tts: {} }} />);
    expect(screen.getByText('TTS Component')).toBeInTheDocument();
    expect(screen.getByText('Translate Component')).toBeInTheDocument();
  });
});
