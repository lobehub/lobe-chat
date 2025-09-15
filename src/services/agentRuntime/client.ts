import { fetchEventSource } from '@lobechat/utils/client';
import debug from 'debug';

import { HumanInterventionRequest, StreamConnectionOptions, StreamEvent } from './type';

const log = debug('lobe-agent-runtime:client');

/**
 * Agent Client Service for communicating with durable agents
 */
class AgentRuntimeClient {
  private baseUrl = '/api/agent';

  /**
   * Get session status
   */
  async getSessionStatus(sessionId: string, includeHistory = false): Promise<any> {
    const params = new URLSearchParams({
      includeHistory: includeHistory.toString(),
      sessionId,
    });

    const response = await fetch(`${this.baseUrl}/session?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get session status' }));
      throw new Error(error.error || 'Failed to get session status');
    }

    return response.json();
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/session?sessionId=${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete session' }));
      throw new Error(error.error || 'Failed to delete session');
    }
  }

  /**
   * Handle human intervention
   */
  async handleHumanIntervention(request: HumanInterventionRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/human-intervention`, {
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Failed to handle human intervention' }));
      throw new Error(error.error || 'Failed to handle human intervention');
    }

    return response.json();
  }

  /**
   * Create a streaming connection to receive real-time agent events
   */
  createStreamConnection(
    sessionId: string,
    options: StreamConnectionOptions = {},
  ): AbortController {
    const {
      includeHistory = false,
      lastEventId = '0',
      onEvent,
      onError,
      onConnect,
      onDisconnect,
    } = options;

    const params = new URLSearchParams({
      includeHistory: includeHistory.toString(),
      lastEventId,
      sessionId,
    });

    const controller = new AbortController();

    fetchEventSource(`${this.baseUrl}/stream?${params}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Last-Event-ID': lastEventId,
      },
      onclose: () => {
        log(`Stream connection closed for session ${sessionId}`);
        onDisconnect?.();
      },
      onerror: (error) => {
        console.error(`[AgentClientService] Stream error for session ${sessionId}:`, error);
        onError?.(error instanceof Error ? error : new Error('Stream connection error'));
      },
      onmessage: (event) => {
        try {
          const data = JSON.parse(event.data) as StreamEvent;
          log(`Received event: ${event.event || 'message'}`, event.data);

          onEvent?.(data);
        } catch (error) {
          console.error('[AgentClientService] Failed to parse stream event:', error);
          onError?.(new Error('Failed to parse stream event'));
        }
      },
      onopen: async (response) => {
        if (response.ok) {
          log(`Stream connection opened for session ${sessionId}`);
          onConnect?.();
        } else {
          throw new Error(`Failed to open stream: ${response.status} ${response.statusText}`);
        }
      },
      signal: controller.signal,
    });

    return controller;
  }
}

export const agentRuntimeClient = new AgentRuntimeClient();
