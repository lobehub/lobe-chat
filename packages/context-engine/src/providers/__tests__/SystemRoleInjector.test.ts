import { describe, expect, it } from 'vitest';

import { SystemRoleInjector } from '../SystemRoleInjector';

describe('SystemRoleInjector', () => {
  it('should inject system role at the beginning of messages', async () => {
    const provider = new SystemRoleInjector({
      systemRole: 'You are a helpful assistant.',
    });

    const context = {
      initialState: {
        messages: [],
        model: 'gpt-4',
        provider: 'openai',
        systemRole: '',
        tools: [],
      },
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      metadata: {
        model: 'gpt-4',
        maxTokens: 4096,
      },
      isAborted: false,
    };

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0]).toEqual(
      expect.objectContaining({
        content: 'You are a helpful assistant.',
        role: 'system',
      }),
    );
    expect(result.messages[1]).toEqual(
      expect.objectContaining({
        content: 'Hello',
        role: 'user',
      }),
    );
    expect(result.metadata.systemRoleInjected).toBe(true);
  });

  it('should skip injection when no system role is configured', async () => {
    const provider = new SystemRoleInjector({
      systemRole: '',
    });

    const context = {
      initialState: {
        messages: [],
        model: 'gpt-4',
        provider: 'openai',
        systemRole: '',
        tools: [],
      },
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      metadata: {
        model: 'gpt-4',
        maxTokens: 4096,
      },
      isAborted: false,
    };

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe('user');
    expect(result.metadata.systemRoleInjected).toBeUndefined();
  });

  it('should skip injection when system role already exists', async () => {
    const provider = new SystemRoleInjector({
      systemRole: 'You are a helpful assistant.',
    });

    const context = {
      initialState: {
        messages: [],
        model: 'gpt-4',
        provider: 'openai',
        systemRole: '',
        tools: [],
      },
      messages: [
        {
          id: 'system-1',
          role: 'system',
          content: 'Existing system role',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      metadata: {
        model: 'gpt-4',
        maxTokens: 4096,
      },
      isAborted: false,
    };

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].content).toBe('Existing system role');
    expect(result.metadata.systemRoleInjected).toBeUndefined();
  });

  it('should handle whitespace-only system role', async () => {
    const provider = new SystemRoleInjector({
      systemRole: '   \n  \t  ',
    });

    const context = {
      initialState: {
        messages: [],
        model: 'gpt-4',
        provider: 'openai',
        systemRole: '',
        tools: [],
      },
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      metadata: {
        model: 'gpt-4',
        maxTokens: 4096,
      },
      isAborted: false,
    };

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe('user');
    expect(result.metadata.systemRoleInjected).toBeUndefined();
  });

  it('should handle empty message array', async () => {
    const provider = new SystemRoleInjector({
      systemRole: 'You are a helpful assistant.',
    });

    const context = {
      initialState: {
        messages: [],
        model: 'gpt-4',
        provider: 'openai',
        systemRole: '',
        tools: [],
      },
      messages: [],
      metadata: {
        model: 'gpt-4',
        maxTokens: 4096,
      },
      isAborted: false,
    };

    const result = await provider.process(context);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0]).toEqual(
      expect.objectContaining({
        content: 'You are a helpful assistant.',
        role: 'system',
      }),
    );
    expect(result.metadata.systemRoleInjected).toBe(true);
  });
});
