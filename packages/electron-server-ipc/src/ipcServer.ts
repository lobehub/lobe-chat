import debug from 'debug';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { SOCK_FILE, SOCK_INFO_FILE, WINDOW_PIPE_FILE } from './const';
import { ServerDispatchEventKey } from './events';
import { ElectronIPCEventHandler } from './types';

const log = debug('electron-server-ipc:server');

export class ElectronIPCServer {
  private server: net.Server;
  private socketPath: string;
  private appId: string;
  private eventHandler: ElectronIPCEventHandler;

  constructor(appId: string, eventHandler: ElectronIPCEventHandler) {
    this.appId = appId;
    const isWindows = process.platform === 'win32';
    // 创建唯一的套接字路径，避免冲突
    this.socketPath = isWindows
      ? WINDOW_PIPE_FILE(appId)
      : path.join(os.tmpdir(), SOCK_FILE(appId));

    // 如果是 Unix 套接字，确保文件不存在
    if (!isWindows && fs.existsSync(this.socketPath)) {
      log('Removing existing socket file at: %s', this.socketPath);
      fs.unlinkSync(this.socketPath);
    }

    // 创建服务器
    log('Creating IPC server');
    this.server = net.createServer(this.handleConnection.bind(this));

    this.eventHandler = eventHandler;
  }

  // 启动服务器
  public start(): Promise<void> {
    log('Starting IPC server');
    return new Promise((resolve, reject) => {
      this.server.on('error', (err) => {
        console.error('IPC Server error: %o', err);
        reject(err);
      });

      this.server.listen(this.socketPath, () => {
        log('Electron IPC server listening on %s', this.socketPath);

        // 将套接字路径写入临时文件，供 Next.js 服务端读取
        const tempDir = os.tmpdir();
        const socketInfoPath = path.join(tempDir, SOCK_INFO_FILE(this.appId));
        log('Writing socket info to: %s', socketInfoPath);
        fs.writeFileSync(socketInfoPath, JSON.stringify({ socketPath: this.socketPath }), 'utf8');

        resolve();
      });
    });
  }

  // 处理客户端连接
  private handleConnection(socket: net.Socket): void {
    let dataBuffer = '';
    log('New client connection established');

    socket.on('data', (data) => {
      const chunk = data.toString();
      log('Received data chunk, size: %d bytes', chunk.length);
      dataBuffer += chunk;

      try {
        // 尝试解析 JSON 消息
        const message = JSON.parse(dataBuffer);
        log('Successfully parsed JSON message: %o', {
          id: message.id,
          method: message.method,
        });
        dataBuffer = ''; // 重置缓冲区

        // 处理请求
        this.handleRequest(socket, message);
      } catch {
        // 如果不是有效的 JSON，可能是消息不完整，继续等待
        log('Incomplete or invalid JSON, buffering for more data');
      }
    });

    socket.on('error', (err) => {
      console.error('Socket error: %o', err);
    });

    socket.on('close', () => {
      log('Client connection closed');
    });
  }

  // 处理客户端请求
  private handleRequest = async (socket: net.Socket, request: any) => {
    const { id, method, params } = request;
    log('Handling request: %s (ID: %s)', method, id);

    // 根据请求方法执行相应的操作
    const eventHandler = this.eventHandler[method as ServerDispatchEventKey];
    if (!eventHandler) {
      console.error('No handler found for method: %s', method);
      return;
    }

    try {
      log('Executing handler for method: %s with params: %o', method, params);
      const data = await eventHandler(params, { id, method, socket });
      log('Handler execution successful for method: %s', method);

      this.sendResult(socket, id, data);
    } catch (err) {
      const errorMsg = `Failed to handle method(${method}): ${(err as Error).message}`;
      console.error('Error handling request: %s', errorMsg);
      this.sendError(socket, id, errorMsg);
    }
  };

  // 发送结果
  private sendResult(socket: net.Socket, id: string, result: any): void {
    const response = JSON.stringify({ id, result }) + '\n';
    log('Sending success response for ID: %s, size: %d bytes', id, response.length);
    socket.write(response);
  }

  // 发送错误
  private sendError(socket: net.Socket, id: string, error: string): void {
    const response = JSON.stringify({ error, id }) + '\n';
    log('Sending error response for ID: %s: %s', id, error);
    socket.write(response);
  }

  // 关闭服务器
  public close(): Promise<void> {
    log('Closing IPC server');
    return new Promise((resolve) => {
      this.server.close(() => {
        log('Electron IPC server closed');

        // 删除套接字文件（Unix 平台）
        if (process.platform !== 'win32' && fs.existsSync(this.socketPath)) {
          log('Removing socket file: %s', this.socketPath);
          fs.unlinkSync(this.socketPath);
        }

        resolve();
      });
    });
  }
}
