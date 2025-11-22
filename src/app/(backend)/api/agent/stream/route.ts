import { createSSEHeaders, createSSEWriter } from '@lobechat/utils/server';
import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';

import { StreamEventManager } from '@/server/modules/AgentRuntime';

import { isEnableAgent } from '../isEnableAgent';

const log = debug('api-route:agent:stream');

/**
 * Server-Sent Events (SSE) endpoint
 * Provides real-time Agent execution event stream for clients
 */
export async function GET(request: NextRequest) {
  if (!isEnableAgent()) {
    return NextResponse.json({ error: 'Agent features are not enabled' }, { status: 404 });
  }

  // Initialize stream event manager
  const streamManager = new StreamEventManager();

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const lastEventId = searchParams.get('lastEventId') || '0';
  const includeHistory = searchParams.get('includeHistory') === 'true';

  if (!sessionId) {
    return NextResponse.json(
      {
        error: 'sessionId parameter is required',
      },
      { status: 400 },
    );
  }

  log(`Starting SSE connection for session ${sessionId} from eventId ${lastEventId}`);

  // 创建 Server-Sent Events 流
  const stream = new ReadableStream({
    cancel(reason) {
      log(`SSE connection cancelled for session ${sessionId}:`, reason);

      // Call cleanup function
      if ((this as any)._cleanup) {
        (this as any)._cleanup();
      }
    },

    start(controller) {
      const writer = createSSEWriter(controller);

      // 发送连接确认事件
      writer.writeConnection(sessionId, lastEventId);
      log(`SSE connection established for session ${sessionId}`);

      // 如果需要，先发送历史事件
      if (includeHistory) {
        streamManager
          .getStreamHistory(sessionId, 50)
          .then((history) => {
            // 按时间顺序发送历史事件（最早的在前面）
            const sortedHistory = history.reverse();

            sortedHistory.forEach((event) => {
              // 只发送比 lastEventId 更新的事件
              if (!lastEventId || lastEventId === '0' || event.timestamp.toString() > lastEventId) {
                try {
                  // 添加 SSE 特定的字段，保持与实时事件格式一致
                  const sseEvent = {
                    ...event,
                    sessionId,
                    timestamp: event.timestamp || Date.now(),
                  };
                  writer.writeStreamEvent(sseEvent, sessionId);
                } catch (error) {
                  console.error('[Agent Stream] Error sending history event:', error);
                }
              }
            });

            if (sortedHistory.length > 0) {
              log(`Sent ${sortedHistory.length} historical events for session ${sessionId}`);
            }
          })
          .catch((error) => {
            console.error('[Agent Stream] Failed to load history:', error);

            try {
              writer.writeError(error, sessionId, 'history_loading');
            } catch (controllerError) {
              console.error('[Agent Stream] Failed to send error event:', controllerError);
            }
          });
      }

      // 创建 AbortController 用于取消订阅
      const abortController = new AbortController();

      // 订阅新的流式事件
      const subscribeToEvents = async () => {
        try {
          await streamManager.subscribeStreamEvents(
            sessionId,
            lastEventId,
            (events) => {
              events.forEach((event) => {
                try {
                  // 添加 SSE 特定的字段
                  const sseEvent = {
                    ...event,
                    sessionId,
                    timestamp: event.timestamp || Date.now(),
                  };

                  writer.writeStreamEvent(sseEvent, sessionId);

                  // 如果收到 agent_runtime_end 事件，停止心跳并准备关闭连接
                  if (event.type === 'agent_runtime_end') {
                    log(
                      `Agent runtime ended for session ${sessionId}, preparing to close connection`,
                    );

                    // 延迟关闭连接，确保客户端有时间处理最后的事件
                    setTimeout(() => {
                      try {
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        cleanup();
                        controller.close();
                        log(
                          `SSE connection closed after agent runtime end for session ${sessionId}`,
                        );
                      } catch (closeError) {
                        console.error('[Agent Stream] Error closing connection:', closeError);
                      }
                    }, 1000); // 1秒延迟，给客户端处理时间
                  }
                } catch (error) {
                  console.error('[Agent Stream] Error sending event:', error);
                }
              });
            },
            abortController.signal,
          );
        } catch (error) {
          if (!abortController.signal.aborted) {
            console.error('[Agent Stream] Subscription error:', error);

            try {
              writer.writeError(error as Error, sessionId, 'stream_subscription');
            } catch (controllerError) {
              console.error('[Agent Stream] Failed to send subscription error:', controllerError);
            }
          }
        }
      };

      // 开始订阅
      subscribeToEvents();

      // 定期发送心跳（每 30 秒）
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = {
            sessionId,
            timestamp: Date.now(),
            type: 'heartbeat',
          };

          controller.enqueue(`data: ${JSON.stringify(heartbeat)}\n\n`);
        } catch (error) {
          console.error('[Agent Stream] Heartbeat error:', error);
          clearInterval(heartbeatInterval);
        }
      }, 30_000);

      // Cleanup function
      const cleanup = () => {
        abortController.abort();
        clearInterval(heartbeatInterval);
        log(`SSE connection closed for session ${sessionId}`);
      };

      // 监听连接关闭
      request.signal?.addEventListener('abort', cleanup);

      // 存储清理函数以便在 cancel 时调用
      (controller as any)._cleanup = cleanup;
    },
  });

  // 设置 SSE 响应头
  return new Response(stream, {
    headers: createSSEHeaders(),
  });
}
