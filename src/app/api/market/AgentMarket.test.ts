import { describe, expect, it } from 'vitest';

import { AgentMarket } from './AgentMarket';

const baseURL = 'https://chat-agents.lobehub.com';
describe('AgentMarket', () => {
  it('should return the default index URL when no language is provided', () => {
    const agentMarket = new AgentMarket();
    const url = agentMarket.getAgentIndexUrl();
    expect(url).toBe(baseURL);
  });

  it('should return the index URL for a supported language', () => {
    const agentMarket = new AgentMarket();
    const url = agentMarket.getAgentIndexUrl('ko-KR');
    expect(url).toBe('https://chat-agents.lobehub.com/index.ko-KR.json');
  });

  it('should return the zh-CN URL for zh locale', () => {
    const agentMarket = new AgentMarket();
    const url = agentMarket.getAgentIndexUrl('zh' as any);
    expect(url).toBe('https://chat-agents.lobehub.com/index.zh-CN.json');
  });

  it('should return the default URL for en locale', () => {
    const agentMarket = new AgentMarket();
    const url = agentMarket.getAgentIndexUrl('en' as any);
    expect(url).toBe('https://chat-agents.lobehub.com');
  });

  it('should return the base URL if the provided language is not supported', () => {
    const agentMarket = new AgentMarket();
    const url = agentMarket.getAgentIndexUrl('fr' as any);
    expect(url).toBe(baseURL);
  });

  it('should return the agent URL with default language when no language is provided', () => {
    const agentMarket = new AgentMarket();
    const url = agentMarket.getAgentUrl('agent-123');
    expect(url).toBe(`${baseURL}/agent-123.json`);
  });

  it('should return the agent URL for a supported language', () => {
    const agentMarket = new AgentMarket();
    const url = agentMarket.getAgentUrl('agent-123', 'es-ES');
    expect(url).toBe(`${baseURL}/agent-123.es-ES.json`);
  });

  it('should return the agent URL without language suffix if the provided language is not supported', () => {
    const agentMarket = new AgentMarket();
    const url = agentMarket.getAgentUrl('agent-123', 'fr' as any);
    expect(url).toBe(`${baseURL}/agent-123.json`);
  });
});
