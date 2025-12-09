// @ts-nocheck
// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { agentRuntimeClient } from '../client';

// Mock EventSource
class MockEventSource {
  url: string;
  readyState: number = 0;
  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  private listeners: { [key: string]: Array<(event: any) => void> } = {};

  constructor(url: string) {
    this.url = url;
    this.readyState = 1; // OPEN

    // Simulate connection opening - use setImmediate to ensure listeners are set up first
    setImmediate(() => {
      this.onopen?.({ type: 'open' });
      this.listeners['open']?.forEach((listener) => listener({ type: 'open' }));
    });
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    if (this.listeners[type]) {
      const index = this.listeners[type].indexOf(listener);
      if (index > -1) {
        this.listeners[type].splice(index, 1);
      }
    }
  }

  close() {
    this.readyState = 2; // CLOSED
  }

  // Test helper method to simulate receiving messages
  _simulateMessage(data: string, eventType?: string, id?: string) {
    const event = {
      data,
      type: 'message',
      lastEventId: id || '',
    };

    this.onmessage?.(event);
  }

  // Test helper method to simulate errors
  _simulateError() {
    this.onerror?.({ type: 'error' });
  }
}

// Mock global EventSource
global.EventSource = MockEventSource as any;

describe('AgentRuntimeClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createStreamConnection', () => {
    it('should create EventSource with correct URL and parameters', () => {
      const sessionId = 'agent_1758302563222_0g28qmdmu';

      const eventSource = agentRuntimeClient.createStreamConnection(sessionId, {
        includeHistory: false,
        lastEventId: '0',
      });

      expect(eventSource.url).toBe(
        '/api/agent/stream?includeHistory=false&lastEventId=0&sessionId=agent_1758302563222_0g28qmdmu',
      );
    });

    it('should handle complete agent runtime lifecycle with real stream data', async () => {
      const sessionId = 'agent_1758302563222_abc';
      const events: any[] = [];
      let connectCalled = false;
      let disconnectCalled = false;
      let errorCalled = false;

      const eventSource = agentRuntimeClient.createStreamConnection(sessionId, {
        includeHistory: false,
        onConnect: () => {
          connectCalled = true;
        },
        onDisconnect: () => {
          disconnectCalled = true;
        },
        onError: (error) => {
          errorCalled = true;
        },
        onEvent: (event) => {
          events.push(event);
        },
      }) as MockEventSource;

      // Wait for connection
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(connectCalled).toBe(true);

      // Simulate the complete SSE stream from the real data
      const streamEvents = [
        // 1. Connected event
        `{"lastEventId":"0","sessionId":"${sessionId}","timestamp":1758302567925,"type":"connected"}`,

        // 2. Agent runtime init
        `{"type":"agent_runtime_init","stepIndex":0,"sessionId":"${sessionId}","data":{"agentConfig":{"enableSearch":true,"maxSteps":50},"createdAt":"2025-09-19T17:22:43.222Z","lastActiveAt":"2025-09-19T17:22:43.222Z","modelRuntimeConfig":{"model":"gpt-5-mini","provider":"openai"},"status":"idle","totalCost":0,"totalSteps":0,"userId":"inbox"},"timestamp":1758302564421,"id":"1758302567005-0"}`,

        // 3. Step start
        `{"type":"step_start","stepIndex":0,"sessionId":"${sessionId}","data":{"sessionId":"${sessionId}","stepIndex":0},"timestamp":1758302573386,"id":"1758302573993-0"}`,

        // 4. Stream start
        `{"type":"stream_start","stepIndex":0,"sessionId":"${sessionId}","data":{"messageId":"unknown","model":"gpt-5-mini","provider":"openai","sessionId":"${sessionId}"},"timestamp":1758302574552,"id":"1758302574662-0"}`,

        // 5. Some stream chunks (sample)
        `{"type":"stream_chunk","stepIndex":0,"sessionId":"${sessionId}","data":{"chunkType":"text","content":"Do","fullContent":"Do","messageId":"unknown"},"timestamp":1758302578042,"id":"1758302578151-0"}`,
        `{"type":"stream_chunk","stepIndex":0,"sessionId":"${sessionId}","data":{"chunkType":"text","content":" you","fullContent":"Do you","messageId":"unknown"},"timestamp":1758302578490,"id":"1758302578600-0"}`,
        `{"type":"stream_chunk","stepIndex":0,"sessionId":"${sessionId}","data":{"chunkType":"text","content":" mean","fullContent":"Do you mean","messageId":"unknown"},"timestamp":1758302578935,"id":"1758302579045-0"}`,

        // 6. Stream end
        `{"type":"stream_end","stepIndex":0,"sessionId":"${sessionId}","data":{"finalContent":"Do you mean the number 123? How can I help with it — conversions, math, encoding, or something else?\\n\\nQuick facts in case it's useful:\\n- Decimal: 123\\n- Binary: 1111011\\n- Hex: 0x7B\\n- Octal: 173\\n- Prime factorization: 3 × 41\\n- Sum of digits: 1+2+3 = 6\\n- ASCII code 123 = '{'\\n\\nTell me which of these (or something else) you want.","grounding":null,"messageId":"unknown","toolCalls":[]},"timestamp":1758302626595,"id":"1758302626704-0"}`,

        // 7. Step complete (first step)
        `{"type":"step_complete","stepIndex":0,"sessionId":"${sessionId}","data":{"finalState":{"events":[],"lastModified":"2025-09-19T17:22:54.552Z","messages":[{"content":"123","role":"user"},{"content":"Do you mean the number 123? How can I help with it — conversions, math, encoding, or something else?\\n\\nQuick facts in case it's useful:\\n- Decimal: 123\\n- Binary: 1111011\\n- Hex: 0x7B\\n- Octal: 173\\n- Prime factorization: 3 × 41\\n- Sum of digits: 1+2+3 = 6\\n- ASCII code 123 = '{'\\n\\nTell me which of these (or something else) you want.","role":"assistant"}],"metadata":{"agentConfig":{"enableSearch":true,"maxSteps":50},"createdAt":"2025-09-19T17:22:43.222Z","modelRuntimeConfig":{"model":"gpt-5-mini","provider":"openai"},"userId":"inbox"},"sessionId":"${sessionId}","status":"idle","stepCount":1},"nextStepScheduled":true,"stepIndex":0},"timestamp":1758302627846,"id":"1758302627955-0"}`,

        // 8. Step start (second step)
        `{"type":"step_start","stepIndex":1,"sessionId":"${sessionId}","data":{"sessionId":"${sessionId}","stepIndex":1},"timestamp":1758302629691,"id":"1758302629800-0"}`,

        // 9. Step complete (final execution)
        `{"type":"step_complete","stepIndex":0,"sessionId":"${sessionId}","data":{"finalState":{"events":[],"lastModified":"2025-09-19T17:23:50.360Z","messages":[{"content":"123","role":"user"},{"content":"Do you mean the number 123? How can I help with it — conversions, math, encoding, or something else?\\n\\nQuick facts in case it's useful:\\n- Decimal: 123\\n- Binary: 1111011\\n- Hex: 0x7B\\n- Octal: 173\\n- Prime factorization: 3 × 41\\n- Sum of digits: 1+2+3 = 6\\n- ASCII code 123 = '{'\\n\\nTell me which of these (or something else) you want.","role":"assistant"}],"metadata":{"agentConfig":{"enableSearch":true,"maxSteps":50},"createdAt":"2025-09-19T17:22:43.222Z","modelRuntimeConfig":{"model":"gpt-5-mini","provider":"openai"},"userId":"inbox"},"sessionId":"${sessionId}","status":"done","stepCount":2},"phase":"execution_complete","reason":"completed","reasonDetail":"Simple agent completed successfully"},"timestamp":1758302630360,"id":"1758302630469-0"}`,

        // 10. Agent runtime end
        `{"type":"agent_runtime_end","stepIndex":1,"sessionId":"${sessionId}","data":{"finalState":{"events":[],"lastModified":"2025-09-19T17:23:50.360Z","messages":[{"content":"123","role":"user"},{"content":"Do you mean the number 123? How can I help with it — conversions, math, encoding, or something else?\\n\\nQuick facts in case it's useful:\\n- Decimal: 123\\n- Binary: 1111011\\n- Hex: 0x7B\\n- Octal: 173\\n- Prime factorization: 3 × 41\\n- Sum of digits: 1+2+3 = 6\\n- ASCII code 123 = '{'\\n\\nTell me which of these (or something else) you want.","role":"assistant"}],"metadata":{"agentConfig":{"enableSearch":true,"maxSteps":50},"createdAt":"2025-09-19T17:22:43.222Z","modelRuntimeConfig":{"model":"gpt-5-mini","provider":"openai"},"userId":"inbox"},"sessionId":"${sessionId}","status":"done","stepCount":2},"phase":"execution_complete","reason":"completed","reasonDetail":"Agent runtime completed successfully","sessionId":"${sessionId}"},"timestamp":1758302631030,"id":"1758302631139-0"}`,

        // 11. Final step complete
        `{"type":"step_complete","stepIndex":1,"sessionId":"${sessionId}","data":{"finalState":{"events":[],"lastModified":"2025-09-19T17:23:50.360Z","messages":[{"content":"123","role":"user"},{"content":"Do you mean the number 123? How can I help with it — conversions, math, encoding, or something else?\\n\\nQuick facts in case it's useful:\\n- Decimal: 123\\n- Binary: 1111011\\n- Hex: 0x7B\\n- Octal: 173\\n- Prime factorization: 3 × 41\\n- Sum of digits: 1+2+3 = 6\\n- ASCII code 123 = '{'\\n\\nTell me which of these (or something else) you want.","role":"assistant"}],"metadata":{"agentConfig":{"enableSearch":true,"maxSteps":50},"createdAt":"2025-09-19T17:22:43.222Z","modelRuntimeConfig":{"model":"gpt-5-mini","provider":"openai"},"userId":"inbox"},"sessionId":"${sessionId}","status":"done","stepCount":2},"nextStepScheduled":false,"stepIndex":1},"timestamp":1758302631475,"id":"1758302631584-0"}`,
      ];

      // Simulate receiving all events
      for (const eventData of streamEvents) {
        eventSource._simulateMessage(eventData);
        // Small delay to simulate real-time streaming
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      // Verify all events were received and parsed correctly (13 total events)
      expect(events).toHaveLength(13);

      // Verify event sequence
      expect(events[0].type).toBe('connected');
      expect(events[1].type).toBe('agent_runtime_init');
      expect(events[2].type).toBe('step_start');
      expect(events[3].type).toBe('stream_start');
      expect(events[4].type).toBe('stream_chunk');
      expect(events[5].type).toBe('stream_chunk');
      expect(events[6].type).toBe('stream_chunk');
      expect(events[7].type).toBe('stream_end');
      expect(events[8].type).toBe('step_complete');
      expect(events[9].type).toBe('step_start');
      expect(events[10].type).toBe('step_complete');
      expect(events[11].type).toBe('agent_runtime_end');
      expect(events[12].type).toBe('step_complete');

      // Verify specific event data
      const connectedEvent = events[0];
      expect(connectedEvent.sessionId).toBe(sessionId);
      expect(connectedEvent.lastEventId).toBe('0');

      const initEvent = events[1];
      expect(initEvent.stepIndex).toBe(0);
      expect(initEvent.initialState.agentConfig.enableSearch).toBe(true);
      expect(initEvent.initialState.modelRuntimeConfig.model).toBe('gpt-5-mini');

      const streamStartEvent = events[3];
      expect(streamStartEvent.data.model).toBe('gpt-5-mini');
      expect(streamStartEvent.data.provider).toBe('openai');

      const streamChunkEvent = events[4];
      expect(streamChunkEvent.data.chunkType).toBe('text');
      expect(streamChunkEvent.data.content).toBe('Do');
      expect(streamChunkEvent.data.fullContent).toBe('Do');

      const streamEndEvent = events[7];
      expect(streamEndEvent.data.finalContent).toContain('Do you mean the number 123?');
      expect(streamEndEvent.data.toolCalls).toEqual([]);

      const stepCompleteEvent = events[8];
      expect(stepCompleteEvent.data.finalState.status).toBe('idle');
      expect(stepCompleteEvent.data.nextStepScheduled).toBe(true);

      const agentRuntimeEndEvent = events[11];
      expect(agentRuntimeEndEvent.type).toBe('agent_runtime_end');
      expect(agentRuntimeEndEvent.data.finalState.status).toBe('done');

      const finalStepCompleteEvent = events[12];
      expect(finalStepCompleteEvent.type).toBe('step_complete');
      expect(finalStepCompleteEvent.data.finalState.status).toBe('done');
      expect(finalStepCompleteEvent.data.nextStepScheduled).toBe(false);

      // Verify session ID consistency
      events.forEach((event, index) => {
        expect(event.sessionId).toBe(sessionId);
      });
    });

    it('should handle heartbeat events correctly', async () => {
      const sessionId = 'test-session';
      const events: any[] = [];

      const eventSource = agentRuntimeClient.createStreamConnection(sessionId, {
        onEvent: (event) => {
          events.push(event);
        },
      }) as MockEventSource;

      // Simulate heartbeat event (no event type, just data)
      const heartbeatData = `{"sessionId":"${sessionId}","timestamp":1758302597927,"type":"heartbeat"}`;
      eventSource._simulateMessage(heartbeatData);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('heartbeat');
      expect(events[0].sessionId).toBe(sessionId);
    });

    it('should handle connection errors', async () => {
      const sessionId = 'test-session';
      let errorOccurred = false;

      const eventSource = agentRuntimeClient.createStreamConnection(sessionId, {
        onError: (error) => {
          errorOccurred = true;
        },
      }) as MockEventSource;

      // Simulate error
      eventSource._simulateError();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(errorOccurred).toBe(true);
    });

    it('should handle malformed JSON gracefully', async () => {
      const sessionId = 'test-session';
      const events: any[] = [];
      let errorOccurred = false;

      const eventSource = agentRuntimeClient.createStreamConnection(sessionId, {
        onEvent: (event) => {
          events.push(event);
        },
        onError: (error) => {
          errorOccurred = true;
        },
      }) as MockEventSource;

      // Simulate malformed JSON
      eventSource._simulateMessage('invalid json');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(events).toHaveLength(0);
      expect(errorOccurred).toBe(true);
    });

    it('should call onDisconnect when EventSource is closed', () => {
      const sessionId = 'test-session';
      let disconnectCalled = false;

      const eventSource = agentRuntimeClient.createStreamConnection(sessionId, {
        onDisconnect: () => {
          disconnectCalled = true;
        },
      });

      eventSource.close();

      expect(disconnectCalled).toBe(true);
    });

    it('should include correct parameters in URL', () => {
      const sessionId = 'test-session-123';

      const eventSource = agentRuntimeClient.createStreamConnection(sessionId, {
        includeHistory: true,
        lastEventId: '12345',
      });

      expect(eventSource.url).toBe(
        '/api/agent/stream?includeHistory=true&lastEventId=12345&sessionId=test-session-123',
      );
    });

    it('should use default parameters when not provided', () => {
      const sessionId = 'test-session';

      const eventSource = agentRuntimeClient.createStreamConnection(sessionId);

      expect(eventSource.url).toBe(
        '/api/agent/stream?includeHistory=false&lastEventId=0&sessionId=test-session',
      );
    });
  });
});
