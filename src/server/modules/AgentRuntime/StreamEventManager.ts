import { ChatToolPayload } from '@lobechat/types';
import debug from 'debug';
import Redis from 'ioredis';

import { getRedisClient } from '@/libs/redis';

const log = debug('lobe-server:agent-runtime:stream-event-manager');

export interface StreamEvent {
  data: any;
  id?: string; // Redis Stream event ID
  sessionId: string;
  stepIndex: number;
  timestamp: number;
  type:
    | 'agent_runtime_init'
    | 'agent_runtime_end'
    | 'stream_start'
    | 'stream_chunk'
    | 'stream_end'
    | 'tool_start'
    | 'tool_end'
    | 'step_start'
    | 'step_complete'
    | 'error';
}

export interface StreamChunkData {
  chunkType: 'text' | 'reasoning' | 'tools_calling' | 'image' | 'grounding';
  content?: string;
  images?: any[];
  reasoning?: string;
  toolsCalling?: ChatToolPayload[];
}

export class StreamEventManager {
  private redis: Redis;
  private readonly STREAM_PREFIX = 'agent_runtime_stream';
  private readonly STREAM_RETENTION = 3600; // 1小时

  constructor() {
    const redisClient = getRedisClient();
    if (!redisClient) {
      throw new Error('Redis is not available. Please configure REDIS_URL environment variable.');
    }
    this.redis = redisClient;
  }

  /**
   * 发布流式事件到 Redis Stream
   */
  async publishStreamEvent(
    sessionId: string,
    event: Omit<StreamEvent, 'sessionId' | 'timestamp'>,
  ): Promise<string> {
    const streamKey = `${this.STREAM_PREFIX}:${sessionId}`;

    const eventData: StreamEvent = {
      ...event,
      sessionId,
      timestamp: Date.now(),
    };

    try {
      const eventId = await this.redis.xadd(
        streamKey,
        'MAXLEN',
        '~',
        '1000', // 限制流长度，防止内存溢出
        '*', // 自动生成 ID
        'type',
        eventData.type,
        'stepIndex',
        eventData.stepIndex.toString(),
        'sessionId',
        eventData.sessionId,
        'data',
        JSON.stringify(eventData.data),
        'timestamp',
        eventData.timestamp.toString(),
      );

      // 设置过期时间
      await this.redis.expire(streamKey, this.STREAM_RETENTION);

      log('Published event %s for session %s:%d', eventData.type, sessionId, eventData.stepIndex);

      return eventId as string;
    } catch (error) {
      console.error('[StreamEventManager] Failed to publish stream event:', error);
      throw error;
    }
  }

  /**
   * 发布流式内容块
   */
  async publishStreamChunk(
    sessionId: string,
    stepIndex: number,
    chunkData: StreamChunkData,
  ): Promise<string> {
    return this.publishStreamEvent(sessionId, {
      data: chunkData,
      stepIndex,
      type: 'stream_chunk',
    });
  }

  /**
   * 发布 Agent 运行时初始化事件
   */
  async publishAgentRuntimeInit(sessionId: string, initialState: any): Promise<string> {
    return this.publishStreamEvent(sessionId, {
      data: initialState,
      stepIndex: 0,
      type: 'agent_runtime_init',
    });
  }

  /**
   * 发布 Agent 运行时结束事件
   */
  async publishAgentRuntimeEnd(
    sessionId: string,
    stepIndex: number,
    finalState: any,
    reason?: string,
    reasonDetail?: string,
  ): Promise<string> {
    return this.publishStreamEvent(sessionId, {
      data: {
        finalState,
        phase: 'execution_complete',
        reason: reason || 'completed',
        reasonDetail: reasonDetail || 'Agent runtime completed successfully',
        sessionId,
      },
      stepIndex,
      type: 'agent_runtime_end',
    });
  }

  /**
   * 订阅流式事件（用于 WebSocket/SSE）
   */
  async subscribeStreamEvents(
    sessionId: string,
    lastEventId: string = '0',
    onEvents: (events: StreamEvent[]) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const streamKey = `${this.STREAM_PREFIX}:${sessionId}`;
    let currentLastId = lastEventId;

    log('Starting subscription for session %s from %s', sessionId, lastEventId);

    while (!signal?.aborted) {
      try {
        const results = await this.redis.xread(
          'BLOCK',
          1000, // 1秒超时
          'STREAMS',
          streamKey,
          currentLastId,
        );

        if (results && results.length > 0) {
          const [, messages] = results[0];
          const events: StreamEvent[] = [];

          for (const [id, fields] of messages) {
            const eventData: any = {};

            // 解析 Redis Stream 字段
            for (let i = 0; i < fields.length; i += 2) {
              const key = fields[i];
              const value = fields[i + 1];

              if (key === 'data') {
                eventData[key] = JSON.parse(value);
              } else if (key === 'stepIndex' || key === 'timestamp') {
                eventData[key] = parseInt(value);
              } else {
                eventData[key] = value;
              }
            }

            events.push({
              ...eventData,
              id, // Redis Stream 事件 ID
            } as StreamEvent);

            currentLastId = id;
          }

          if (events.length > 0) {
            onEvents(events);
          }
        }
      } catch (error) {
        if (signal?.aborted) {
          break;
        }

        console.error('[StreamEventManager] Stream subscription error:', error);
        // 短暂延迟后重试
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
      }
    }

    log('Subscription ended for session %s', sessionId);
  }

  /**
   * 获取流式事件历史
   */
  async getStreamHistory(sessionId: string, count: number = 100): Promise<StreamEvent[]> {
    const streamKey = `${this.STREAM_PREFIX}:${sessionId}`;

    try {
      const results = await this.redis.xrevrange(streamKey, '+', '-', 'COUNT', count);

      return results.map(([id, fields]) => {
        const eventData: any = { id };

        for (let i = 0; i < fields.length; i += 2) {
          const key = fields[i];
          const value = fields[i + 1];

          if (key === 'data') {
            eventData[key] = JSON.parse(value);
          } else if (key === 'stepIndex' || key === 'timestamp') {
            eventData[key] = parseInt(value);
          } else {
            eventData[key] = value;
          }
        }

        return eventData as StreamEvent;
      });
    } catch (error) {
      console.error('[StreamEventManager] Failed to get stream history:', error);
      return [];
    }
  }

  /**
   * 清理会话的流式数据
   */
  async cleanupSession(sessionId: string): Promise<void> {
    const streamKey = `${this.STREAM_PREFIX}:${sessionId}`;

    try {
      await this.redis.del(streamKey);
      log('Cleaned up session %s', sessionId);
    } catch (error) {
      console.error('[StreamEventManager] Failed to cleanup session:', error);
    }
  }

  /**
   * 获取活跃会话数量
   */
  async getActiveSessionsCount(): Promise<number> {
    try {
      const pattern = `${this.STREAM_PREFIX}:*`;
      const keys = await this.redis.keys(pattern);
      return keys.length;
    } catch (error) {
      console.error('[StreamEventManager] Failed to get active sessions count:', error);
      return 0;
    }
  }

  /**
   * 关闭 Redis 连接
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
