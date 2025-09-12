import { describe, expect, it } from 'vitest';

import type { PipelineContext } from '../../types';
import { ToolSystemRoleProvider } from '../ToolSystemRole';

const createContext = (messages: any[]): PipelineContext => ({
  initialState: { messages: [] } as any,
  messages,
  metadata: { model: 'gpt-4', maxTokens: 4096 },
  isAborted: false,
});

describe('ToolSystemRoleProvider', () => {
  const mockToolSystemRole = 'You have access to the following tools:\n- calculator\n- weather';

  it('should inject tool system role when tools are available and FC is supported', async () => {
    const mockGetToolSystemRoles = (tools: any[]) => mockToolSystemRole;
    const mockIsCanUseFC = (model: string, provider: string) => true;

    const provider = new ToolSystemRoleProvider({
      tools: ['calculator', 'weather'],
      model: 'gpt-4',
      provider: 'openai',
      getToolSystemRoles: mockGetToolSystemRoles,
      isCanUseFC: mockIsCanUseFC,
    });

    const messages = [{ id: 'u1', role: 'user', content: 'What is 2+2?' }];

    const ctx = createContext(messages);
    const result = await provider.process(ctx);

    // Should have system message with tool system role
    const systemMessage = result.messages.find((msg) => msg.role === 'system');
    expect(systemMessage).toBeDefined();
    expect(systemMessage!.content).toBe(mockToolSystemRole);

    // Should update metadata
    expect(result.metadata.toolSystemRole).toEqual({
      injected: true,
      toolsCount: 2,
      supportsFunctionCall: true,
      contentLength: mockToolSystemRole.length,
    });
  });

  it('should merge tool system role with existing system message', async () => {
    const mockGetToolSystemRoles = (tools: any[]) => mockToolSystemRole;
    const mockIsCanUseFC = (model: string, provider: string) => true;

    const provider = new ToolSystemRoleProvider({
      tools: ['calculator'],
      model: 'gpt-4',
      provider: 'openai',
      getToolSystemRoles: mockGetToolSystemRoles,
      isCanUseFC: mockIsCanUseFC,
    });

    const existingSystemContent = 'You are a helpful assistant.';
    const messages = [
      { id: 's1', role: 'system', content: existingSystemContent },
      { id: 'u1', role: 'user', content: 'Calculate something' },
    ];

    const ctx = createContext(messages);
    const result = await provider.process(ctx);

    const systemMessage = result.messages.find((msg) => msg.role === 'system');
    expect(systemMessage!.content).toBe(`${existingSystemContent}\n\n${mockToolSystemRole}`);
  });

  it('should skip injection when no tools are available', async () => {
    const mockGetToolSystemRoles = (tools: any[]) => mockToolSystemRole;
    const mockIsCanUseFC = (model: string, provider: string) => true;

    const provider = new ToolSystemRoleProvider({
      tools: [],
      model: 'gpt-4',
      provider: 'openai',
      getToolSystemRoles: mockGetToolSystemRoles,
      isCanUseFC: mockIsCanUseFC,
    });

    const messages = [{ id: 'u1', role: 'user', content: 'Hello' }];

    const ctx = createContext(messages);
    const result = await provider.process(ctx);

    // Should not have system message
    const systemMessage = result.messages.find((msg) => msg.role === 'system');
    expect(systemMessage).toBeUndefined();

    // Should not have metadata
    expect(result.metadata.toolSystemRole).toBeUndefined();
  });

  it('should skip injection when function calling is not supported', async () => {
    const mockGetToolSystemRoles = (tools: any[]) => mockToolSystemRole;
    const mockIsCanUseFC = (model: string, provider: string) => false;

    const provider = new ToolSystemRoleProvider({
      tools: ['calculator'],
      model: 'gpt-3.5-turbo',
      provider: 'openai',
      getToolSystemRoles: mockGetToolSystemRoles,
      isCanUseFC: mockIsCanUseFC,
    });

    const messages = [{ id: 'u1', role: 'user', content: 'Calculate something' }];

    const ctx = createContext(messages);
    const result = await provider.process(ctx);

    // Should not have system message
    const systemMessage = result.messages.find((msg) => msg.role === 'system');
    expect(systemMessage).toBeUndefined();
  });

  it('should skip injection when getToolSystemRoles returns undefined', async () => {
    const mockGetToolSystemRoles = (tools: any[]) => undefined;
    const mockIsCanUseFC = (model: string, provider: string) => true;

    const provider = new ToolSystemRoleProvider({
      tools: ['calculator'],
      model: 'gpt-4',
      provider: 'openai',
      getToolSystemRoles: mockGetToolSystemRoles,
      isCanUseFC: mockIsCanUseFC,
    });

    const messages = [{ id: 'u1', role: 'user', content: 'Calculate something' }];

    const ctx = createContext(messages);
    const result = await provider.process(ctx);

    // Should not have system message
    const systemMessage = result.messages.find((msg) => msg.role === 'system');
    expect(systemMessage).toBeUndefined();
  });
});
