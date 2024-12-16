// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { AssistantStore } from './index';

const baseURL = 'https://registry.npmmirror.com/@lobehub/agents-index/v1/files/public';
describe('AssistantStore', () => {
  it('should return the default index URL when no language is provided', () => {
    const agentMarket = new AssistantStore();
    const url = agentMarket.getAgentIndexUrl();
    expect(url).toBe(`${baseURL}/index.en-US.json`);
  });

  it('should return the index URL for a not supported language', () => {
    const agentMarket = new AssistantStore();
    const url = agentMarket.getAgentIndexUrl('xxx' as any);
    expect(url).toBe('https://registry.npmmirror.com/@lobehub/agents-index/v1/files/public');
  });

  it('should return the zh-CN URL for zh locale', () => {
    const agentMarket = new AssistantStore();
    const url = agentMarket.getAgentIndexUrl('zh' as any);
    expect(url).toBe(
      'https://registry.npmmirror.com/@lobehub/agents-index/v1/files/public/index.zh-CN.json',
    );
  });

  it('should return the default URL for en locale', () => {
    const agentMarket = new AssistantStore();
    const url = agentMarket.getAgentIndexUrl('en' as any);
    expect(url).toBe(
      'https://registry.npmmirror.com/@lobehub/agents-index/v1/files/public/index.en-US.json',
    );
  });

  it('should return the base URL if the provided language is not supported', () => {
    const agentMarket = new AssistantStore();
    const url = agentMarket.getAgentIndexUrl('fr' as any);
    expect(url).toBe(baseURL);
  });

  it('should return the agent URL with default language when no language is provided', () => {
    const agentMarket = new AssistantStore();
    const url = agentMarket.getAgentUrl('agent-123');
    expect(url).toBe(`${baseURL}/agent-123.en-US.json`);
  });

  it('should return the agent URL for a  supported language', () => {
    const agentMarket = new AssistantStore();
    const url = agentMarket.getAgentUrl('agent-123', 'zh-CN');
    expect(url).toBe(`${baseURL}/agent-123.zh-CN.json`);
  });

  it('should return the agent URL without language suffix if the provided language is not supported', () => {
    const agentMarket = new AssistantStore();
    const url = agentMarket.getAgentUrl('agent-123', 'fr' as any);
    expect(url).toBe(`${baseURL}/agent-123.json`);
  });
});
