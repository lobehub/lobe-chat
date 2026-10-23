import { describe, expect, it } from 'vitest';

import { isReadyToSendUrlMessage, type UrlMessageGateInput } from './urlMessageGate';

const ready: UrlMessageGateInput = {
  agentId: 'agt_1',
  contextTopicId: undefined,
  isAccessLoading: false,
  isAgentConfigLoading: false,
  messagesInit: false,
  routeAgentId: 'agt_1',
  routeTopicId: undefined,
};

describe('isReadyToSendUrlMessage', () => {
  it('sends a new-conversation message once the agent is ready', () => {
    expect(isReadyToSendUrlMessage(ready)).toBe(true);
  });

  it('waits for the conversation to switch to the topic the URL names', () => {
    // A project conversation is created before its first message and opened at
    // `/project/:id/conversation/:topicId?message=…`. Sending before the context
    // holds that topic started a second topic outside the project.
    expect(
      isReadyToSendUrlMessage({ ...ready, contextTopicId: undefined, routeTopicId: 'tpc_1' }),
    ).toBe(false);
    expect(
      isReadyToSendUrlMessage({ ...ready, contextTopicId: 'tpc_other', routeTopicId: 'tpc_1' }),
    ).toBe(false);
  });

  it('sends into the named topic once its messages are loaded', () => {
    const switched = { ...ready, contextTopicId: 'tpc_1', routeTopicId: 'tpc_1' };

    expect(isReadyToSendUrlMessage({ ...switched, messagesInit: false })).toBe(false);
    expect(isReadyToSendUrlMessage({ ...switched, messagesInit: true })).toBe(true);
  });

  it('waits while the agent switches, config loads or access resolves', () => {
    expect(isReadyToSendUrlMessage({ ...ready, agentId: undefined })).toBe(false);
    expect(isReadyToSendUrlMessage({ ...ready, routeAgentId: 'agt_2' })).toBe(false);
    expect(isReadyToSendUrlMessage({ ...ready, isAgentConfigLoading: true })).toBe(false);
    expect(isReadyToSendUrlMessage({ ...ready, isAccessLoading: true })).toBe(false);
  });
});
