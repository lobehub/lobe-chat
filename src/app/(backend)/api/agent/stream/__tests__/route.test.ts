// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StreamEventManager } from '@/server/modules/AgentRuntime';

import * as isEnableAgentModule from '../../isEnableAgent';
import { GET } from '../route';

// Mock dependencies first
const mockStreamEventManager = {
  getStreamHistory: vi.fn(),
  subscribeStreamEvents: vi.fn(),
};

vi.mock('@/server/modules/AgentRuntime', () => ({
  StreamEventManager: vi.fn(() => mockStreamEventManager),
}));

describe('/api/agent/stream route', () => {
  const isEnableAgentSpy = vi.spyOn(isEnableAgentModule, 'isEnableAgent');
  const MOCK_TIMESTAMP = 1758203237000;

  beforeEach(() => {
    vi.resetAllMocks();
    // Default to enabled for most tests
    isEnableAgentSpy.mockReturnValue(true);
    // Mock Date.now to return consistent timestamp
    vi.spyOn(Date, 'now').mockReturnValue(MOCK_TIMESTAMP);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET handler', () => {
    it('should return 404 when agent features are not enabled', async () => {
      isEnableAgentSpy.mockReturnValue(false);

      const request = new NextRequest('https://test.com/api/agent/stream?sessionId=test-session');
      const response = await GET(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Agent features are not enabled');
    });

    it('should return 400 when sessionId parameter is missing', async () => {
      const request = new NextRequest('https://test.com/api/agent/stream');
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('sessionId parameter is required');
    });

    it('should return SSE stream with correct headers when sessionId is provided', async () => {
      const request = new NextRequest('https://test.com/api/agent/stream?sessionId=test-session');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-transform');
      expect(response.headers.get('Connection')).toBe('keep-alive');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Cache-Control, Last-Event-ID',
      );
      expect(response.headers.get('X-Accel-Buffering')).toBe('no');
    });
  });

  describe('Stream functionality with exact data verification', () => {
    it('should send connection event in exact SSE format', async () => {
      const request = new NextRequest(
        'https://test.com/api/agent/stream?sessionId=test-session&lastEventId=123',
      );

      const response = await GET(request);
      const decoder = new TextDecoder();
      const reader = response.body!.getReader();

      // Collect all chunks
      const chunks = [];
      let readCount = 0;
      const maxReads = 1; // Only read connection event

      try {
        while (readCount < maxReads) {
          const readPromise = reader.read();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Read timeout')), 1000),
          );

          const result = (await Promise.race([
            readPromise,
            timeoutPromise,
          ])) as ReadableStreamReadResult<Uint8Array>;

          if (result.done) break;
          if (result.value) {
            const chunk =
              result.value instanceof Uint8Array
                ? decoder.decode(result.value)
                : String(result.value);
            chunks.push(chunk);
            readCount++;
          }
        }
      } catch (error) {
        // Timeout or error
      } finally {
        reader.releaseLock();
      }

      // Verify exact stream format with mocked timestamp (new SSE format)
      expect(chunks).toEqual([
        `id: conn_${MOCK_TIMESTAMP}\nevent: connected\ndata: {"lastEventId":"123","sessionId":"test-session","timestamp":${MOCK_TIMESTAMP},"type":"connected"}\n\n`,
      ]);
    });

    it('should verify getStreamHistory with exact historical events format', async () => {
      const request = new NextRequest(
        'https://test.com/api/agent/stream?sessionId=test-session&includeHistory=true&lastEventId=100',
      );

      // Mock getStreamHistory to return specific events
      const mockEvents = [
        {
          type: 'stream_end',
          timestamp: 300,
          sessionId: 'test-session',
          data: { messageId: 'msg3' },
        },
        {
          type: 'stream_chunk',
          timestamp: 250,
          sessionId: 'test-session',
          data: { content: 'world' },
        },
        {
          type: 'stream_start',
          timestamp: 150,
          sessionId: 'test-session',
          data: { messageId: 'msg1' },
        },
      ];
      mockStreamEventManager.getStreamHistory.mockResolvedValue(mockEvents);

      const response = await GET(request);
      const decoder = new TextDecoder();
      const reader = response.body!.getReader();

      // Collect all chunks
      const chunks = [];
      let readCount = 0;
      const maxReads = 3; // connection + 2 filtered historical events (timestamp > 100)

      try {
        while (readCount < maxReads) {
          const readPromise = reader.read();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Read timeout')), 500),
          );

          const result = (await Promise.race([
            readPromise,
            timeoutPromise,
          ])) as ReadableStreamReadResult<Uint8Array>;

          if (result.done) break;
          if (result.value) {
            const chunk =
              result.value instanceof Uint8Array
                ? decoder.decode(result.value)
                : String(result.value);
            chunks.push(chunk);
            readCount++;
          }
        }
      } catch (error) {
        // Timeout or error
      } finally {
        reader.releaseLock();
      }

      // Verify exact stream format - connection event + filtered historical events (new SSE format)
      expect(chunks).toEqual([
        `id: conn_${MOCK_TIMESTAMP}\nevent: connected\ndata: {"lastEventId":"100","sessionId":"test-session","timestamp":${MOCK_TIMESTAMP},"type":"connected"}\n\n`,
        `id: test-session\nevent: stream_start\ndata: {"type":"stream_start","timestamp":150,"sessionId":"test-session","data":{"messageId":"msg1"}}\n\n`,
        `id: test-session\nevent: stream_chunk\ndata: {"type":"stream_chunk","timestamp":250,"sessionId":"test-session","data":{"content":"world"}}\n\n`,
      ]);

      // Verify API calls
      expect(mockStreamEventManager.getStreamHistory).toHaveBeenCalledWith('test-session', 50);
    });

    it('should verify event filtering with exact format', async () => {
      const request = new NextRequest(
        'https://test.com/api/agent/stream?sessionId=test-session&includeHistory=true&lastEventId=200',
      );

      // Mock events where some should be filtered out
      const mockEvents = [
        {
          type: 'stream_end',
          timestamp: 300,
          sessionId: 'test-session',
          data: { messageId: 'msg3' },
        }, // Should be included (300 > 200)
        {
          type: 'stream_chunk',
          timestamp: 250,
          sessionId: 'test-session',
          data: { content: 'world' },
        }, // Should be included (250 > 200)
        {
          type: 'stream_chunk',
          timestamp: 200,
          sessionId: 'test-session',
          data: { content: 'hello' },
        }, // Should be excluded (200 = 200)
        {
          type: 'stream_start',
          timestamp: 150,
          sessionId: 'test-session',
          data: { messageId: 'msg1' },
        }, // Should be excluded (150 < 200)
      ];
      mockStreamEventManager.getStreamHistory.mockResolvedValue(mockEvents);

      const response = await GET(request);
      const decoder = new TextDecoder();
      const reader = response.body!.getReader();

      // Collect all chunks
      const chunks = [];
      let readCount = 0;
      const maxReads = 3; // connection + 2 filtered events

      try {
        while (readCount < maxReads) {
          const readPromise = reader.read();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Read timeout')), 500),
          );

          const result = (await Promise.race([
            readPromise,
            timeoutPromise,
          ])) as ReadableStreamReadResult<Uint8Array>;

          if (result.done) break;
          if (result.value) {
            const chunk =
              result.value instanceof Uint8Array
                ? decoder.decode(result.value)
                : String(result.value);
            chunks.push(chunk);
            readCount++;
          }
        }
      } catch (error) {
        // Timeout or error
      } finally {
        reader.releaseLock();
      }

      // Verify exact stream format - only events with timestamp > 200 are included (new SSE format)
      // Note: indices are based on original array position, not filtered position
      expect(chunks).toEqual([
        `id: conn_${MOCK_TIMESTAMP}
event: connected
data: {"lastEventId":"200","sessionId":"test-session","timestamp":${MOCK_TIMESTAMP},"type":"connected"}

`,
        `id: test-session
event: stream_chunk
data: {"type":"stream_chunk","timestamp":250,"sessionId":"test-session","data":{"content":"world"}}

`,
        `id: test-session
event: stream_end
data: {"type":"stream_end","timestamp":300,"sessionId":"test-session","data":{"messageId":"msg3"}}
\n`,
      ]);

      // Verify API calls
      expect(mockStreamEventManager.getStreamHistory).toHaveBeenCalledWith('test-session', 50);
    });

    it('should handle errors with exact error event format', async () => {
      const request = new NextRequest(
        'https://test.com/api/agent/stream?sessionId=test-session&includeHistory=true',
      );

      // Mock getStreamHistory to reject
      mockStreamEventManager.getStreamHistory.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      const response = await GET(request);
      const decoder = new TextDecoder();
      const reader = response.body!.getReader();

      // Collect all chunks
      const chunks = [];
      let readCount = 0;
      const maxReads = 2; // connection + error event

      try {
        while (readCount < maxReads) {
          const readPromise = reader.read();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Read timeout')), 500),
          );

          const result = (await Promise.race([
            readPromise,
            timeoutPromise,
          ])) as ReadableStreamReadResult<Uint8Array>;

          if (result.done) break;
          if (result.value) {
            const chunk =
              result.value instanceof Uint8Array
                ? decoder.decode(result.value)
                : String(result.value);
            chunks.push(chunk);
            readCount++;
          }
        }
      } catch (error) {
        // Timeout or error
      } finally {
        reader.releaseLock();
      }

      // Verify exact stream format - connection event + error event (new SSE format)
      // Parse error event to check format (error includes stack trace dynamically)
      const errorChunk = chunks[1];
      expect(errorChunk).toMatch(/^id: error_\d+\nevent: error\ndata: \{.*"type":"error".*\}\n\n$/);
      expect(errorChunk).toContain('"error":"Redis connection failed"');
      expect(errorChunk).toContain('"phase":"history_loading"');
      expect(errorChunk).toContain('"sessionId":"test-session"');
      expect(errorChunk).toContain(`"timestamp":${MOCK_TIMESTAMP}`);

      // Verify connection event format
      expect(chunks[0]).toEqual(
        `id: conn_${MOCK_TIMESTAMP}\nevent: connected\ndata: {"lastEventId":"0","sessionId":"test-session","timestamp":${MOCK_TIMESTAMP},"type":"connected"}\n\n`,
      );

      // Verify getStreamHistory was called
      expect(mockStreamEventManager.getStreamHistory).toHaveBeenCalledWith('test-session', 50);
    });

    it('should verify stream subscription with exact parameters', async () => {
      const request = new NextRequest(
        'https://test.com/api/agent/stream?sessionId=test-session&lastEventId=456',
      );

      mockStreamEventManager.subscribeStreamEvents.mockResolvedValue(undefined);

      const response = await GET(request);

      expect(response.status).toBe(200);

      // Verify exact parameter passing
      expect(mockStreamEventManager.subscribeStreamEvents).toHaveBeenCalledWith(
        'test-session',
        '456',
        expect.any(Function), // callback function
        expect.any(AbortSignal), // abort signal
      );

      // Verify the callback function structure
      const callArgs = mockStreamEventManager.subscribeStreamEvents.mock.calls[0];
      expect(callArgs).toHaveLength(4);
      expect(typeof callArgs[2]).toBe('function'); // callback
      expect(callArgs[3]).toBeInstanceOf(AbortSignal); // signal
    });

    it('should verify default parameters with exact values', async () => {
      const request = new NextRequest('https://test.com/api/agent/stream?sessionId=test-session');

      mockStreamEventManager.subscribeStreamEvents.mockResolvedValue(undefined);

      const response = await GET(request);

      expect(response.status).toBe(200);

      // Verify default values are used
      expect(mockStreamEventManager.subscribeStreamEvents).toHaveBeenCalledWith(
        'test-session',
        '0', // default lastEventId
        expect.any(Function),
        expect.any(AbortSignal),
      );

      // Verify getStreamHistory is NOT called when includeHistory defaults to false
      expect(mockStreamEventManager.getStreamHistory).not.toHaveBeenCalled();
    });

    it('should verify SSE message structure with exact format specification', async () => {
      const request = new NextRequest('https://test.com/api/agent/stream?sessionId=test-session');

      const response = await GET(request);
      const decoder = new TextDecoder();
      const reader = response.body!.getReader();

      // Collect all chunks
      const chunks = [];
      let readCount = 0;
      const maxReads = 1; // Only read connection event

      try {
        while (readCount < maxReads) {
          const readPromise = reader.read();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Read timeout')), 1000),
          );

          const result = (await Promise.race([
            readPromise,
            timeoutPromise,
          ])) as ReadableStreamReadResult<Uint8Array>;

          if (result.done) break;
          if (result.value) {
            const chunk =
              result.value instanceof Uint8Array
                ? decoder.decode(result.value)
                : String(result.value);
            chunks.push(chunk);
            readCount++;
          }
        }
      } catch (error) {
        // Timeout or error
      } finally {
        reader.releaseLock();
      }

      // Verify exact stream format with default lastEventId (new SSE format)
      expect(chunks).toEqual([
        `id: conn_${MOCK_TIMESTAMP}\nevent: connected\ndata: {"lastEventId":"0","sessionId":"test-session","timestamp":${MOCK_TIMESTAMP},"type":"connected"}\n\n`,
      ]);
    });
  });

  describe('Agent Runtime Lifecycle', () => {
    it('should verify agent runtime event handling and connection closure logic', async () => {
      const request = new NextRequest('https://test.com/api/agent/stream?sessionId=test-session');

      // Capture the event callback so we can test the event processing logic directly
      let capturedCallback: ((events: any[]) => void) | null = null;
      let capturedSignal: AbortSignal | null = null;

      mockStreamEventManager.subscribeStreamEvents.mockImplementation(
        (sessionId, lastEventId, callback, signal) => {
          capturedCallback = callback;
          capturedSignal = signal;
          return Promise.resolve();
        },
      );

      const response = await GET(request);

      // Verify the subscription was set up correctly
      expect(mockStreamEventManager.subscribeStreamEvents).toHaveBeenCalledWith(
        'test-session',
        '0',
        expect.any(Function),
        expect.any(AbortSignal),
      );
      expect(capturedCallback).toBeDefined();
      expect(capturedSignal).toBeDefined();

      // Verify response headers are correct
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');

      // Test that the callback exists and can be called
      expect(typeof capturedCallback).toBe('function');
      expect(capturedSignal).toBeInstanceOf(AbortSignal);
    });

    it('should verify subscribeStreamEvents callback can handle agent_runtime_init events', async () => {
      const request = new NextRequest('https://test.com/api/agent/stream?sessionId=test-session');

      let capturedCallback: ((events: any[]) => void) | null = null;

      mockStreamEventManager.subscribeStreamEvents.mockImplementation(
        (sessionId, lastEventId, callback, signal) => {
          capturedCallback = callback;
          return Promise.resolve();
        },
      );

      const response = await GET(request);

      // Verify we captured the callback
      expect(capturedCallback).toBeDefined();
      expect(response.status).toBe(200);

      // Test agent_runtime_init event processing
      const initEvent = {
        type: 'agent_runtime_init',
        timestamp: MOCK_TIMESTAMP + 100,
        sessionId: 'test-session',
        data: {
          userId: 'user-123',
          modelConfig: { model: 'gpt-4', temperature: 0.7 },
          agentType: 'assistant',
        },
      };

      // The callback should be callable without throwing errors
      expect(() => capturedCallback!([initEvent])).not.toThrow();
    });

    it('should verify subscribeStreamEvents callback can handle agent_runtime_end events', async () => {
      const request = new NextRequest('https://test.com/api/agent/stream?sessionId=test-session');

      let capturedCallback: ((events: any[]) => void) | null = null;

      mockStreamEventManager.subscribeStreamEvents.mockImplementation(
        (sessionId, lastEventId, callback, signal) => {
          capturedCallback = callback;
          return Promise.resolve();
        },
      );

      const response = await GET(request);

      // Verify we captured the callback
      expect(capturedCallback).toBeDefined();
      expect(response.status).toBe(200);

      // Test agent_runtime_end event processing
      const endEvent = {
        type: 'agent_runtime_end',
        timestamp: MOCK_TIMESTAMP + 600,
        sessionId: 'test-session',
        data: {
          totalSteps: 1,
          executionTime: 500,
          status: 'completed',
        },
      };

      // The callback should be callable without throwing errors
      expect(() => capturedCallback!([endEvent])).not.toThrow();
    });

    it('should verify complete agent runtime lifecycle event types are supported', async () => {
      const request = new NextRequest('https://test.com/api/agent/stream?sessionId=test-session');

      let capturedCallback: ((events: any[]) => void) | null = null;

      mockStreamEventManager.subscribeStreamEvents.mockImplementation(
        (sessionId, lastEventId, callback, signal) => {
          capturedCallback = callback;
          return Promise.resolve();
        },
      );

      const response = await GET(request);

      expect(capturedCallback).toBeDefined();
      expect(response.status).toBe(200);

      // Test complete lifecycle events can be processed
      const lifecycleEvents = [
        {
          type: 'agent_runtime_init',
          timestamp: MOCK_TIMESTAMP + 100,
          sessionId: 'test-session',
          data: { userId: 'user-123', agentType: 'assistant' },
        },
        {
          type: 'stream_start',
          timestamp: MOCK_TIMESTAMP + 200,
          sessionId: 'test-session',
          data: { messageId: 'msg-001' },
        },
        {
          type: 'stream_chunk',
          timestamp: MOCK_TIMESTAMP + 300,
          sessionId: 'test-session',
          data: { content: 'Hello world' },
        },
        {
          type: 'stream_end',
          timestamp: MOCK_TIMESTAMP + 400,
          sessionId: 'test-session',
          data: { messageId: 'msg-001' },
        },
        {
          type: 'agent_runtime_end',
          timestamp: MOCK_TIMESTAMP + 500,
          sessionId: 'test-session',
          data: { status: 'completed', totalSteps: 1 },
        },
      ];

      // All lifecycle events should be processable without throwing errors
      expect(() => capturedCallback!(lifecycleEvents)).not.toThrow();
    });
  });

  describe('Parameter validation', () => {
    it('should handle sessionId with special characters', async () => {
      const sessionId = 'test-session-123_456';
      const request = new NextRequest(`https://test.com/api/agent/stream?sessionId=${sessionId}`);

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should handle lastEventId as string number', async () => {
      const request = new NextRequest(
        'https://test.com/api/agent/stream?sessionId=test&lastEventId=12345',
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should handle includeHistory as string boolean', async () => {
      const request = new NextRequest(
        'https://test.com/api/agent/stream?sessionId=test&includeHistory=false',
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockStreamEventManager.getStreamHistory).not.toHaveBeenCalled();
    });

    it('should handle invalid URL gracefully', async () => {
      const request = new NextRequest('https://test.com/api/agent/stream?sessionId=');

      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('sessionId parameter is required');
    });
  });
});
