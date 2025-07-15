import type { ProxyTRPCRequestParams } from '@lobechat/electron-client-ipc';
import { ipcRenderer } from 'electron';
import { v4 as uuid } from 'uuid';

interface StreamResponse {
  headers: Record<string, string>;
  status: number;
  statusText: string;
}

/**
 * 调用主进程方法并处理流式响应，返回一个标准的 Response 对象。
 * @param params 请求参数
 */
export const invokeStream = (params: ProxyTRPCRequestParams): Promise<Response> => {
  const requestId = uuid();

  // 返回一个 Promise，它会 resolve 为一个 Response 对象
  return new Promise<Response>((resolve, reject) => {
    // 创建一个 ReadableStream 来处理来自主进程的数据块
    const stream = new ReadableStream({
      start(controller) {
        // 1. 定义清理函数，用于移除所有监听器，防止内存泄漏
        const cleanup = () => {
          ipcRenderer.removeAllListeners(`stream:data:${requestId}`);
          ipcRenderer.removeAllListeners(`stream:end:${requestId}`);
          ipcRenderer.removeAllListeners(`stream:error:${requestId}`);
          // response 监听器是 once，会自动移除，但以防万一可以加上
          ipcRenderer.removeAllListeners(`stream:response:${requestId}`);
        };

        // 2. 监听数据块
        ipcRenderer.on(`stream:data:${requestId}`, (_, chunk: Buffer) => {
          // Electron IPC 会将 Buffer 正确传递
          controller.enqueue(new Uint8Array(chunk));
        });

        // 3. 监听流结束信号
        ipcRenderer.once(`stream:end:${requestId}`, () => {
          try {
            controller.close();
          } catch {
            // 控制器可能已经关闭，忽略错误
          }

          cleanup();
        });

        // 4. 监听错误信号
        ipcRenderer.once(`stream:error:${requestId}`, (_, error: Error) => {
          try {
            controller.error(error);
          } catch {
            // 控制器可能已经关闭，忽略错误
          }
          cleanup();
          // 如果流还没开始（即 response 没收到），则直接 reject 外层 Promise
          reject(error);
        });
      },
    });

    // 5. 监听初始响应（包含 headers 和 status）
    // 这个事件只发生一次，用于创建 Response 对象
    ipcRenderer.once(`stream:response:${requestId}`, (_, response: StreamResponse) => {
      const res = new Response(stream, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      });
      // 一旦收到头信息，就用 Response 对象 resolve Promise
      resolve(res);
    });

    // 6. 向主进程发送启动流式请求的信号
    ipcRenderer.send('stream:start', { ...params, requestId });
  });
};
